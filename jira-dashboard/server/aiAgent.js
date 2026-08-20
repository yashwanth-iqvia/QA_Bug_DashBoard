import { classifyMatch, duplicateRecommendation } from './knowledgeBase.js';
import { runCreationAssist } from './creationAssistEngine.js';

function stripHtml(html = '') {
  return String(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function userName(user) {
  return user?.displayName || user?.name || 'Unassigned';
}

export function normalizeJiraIssue(issue, baseUrl, comments = []) {
  const f = issue.fields || {};
  const description = typeof f.description === 'string'
    ? f.description
    : stripHtml(issue.renderedFields?.description || '');

  const commentsText = comments
    .map((c) => `${c.author?.displayName || ''}: ${stripHtml(c.body || '')}`)
    .join('\n');

  return {
    id: issue.id,
    key: issue.key,
    summary: f.summary || '',
    description,
    acceptanceCriteria: f.customfield_15048 || '',
    project: f.project?.key || '',
    reporter: userName(f.reporter),
    assignee: userName(f.assignee),
    priority: f.priority?.name || 'Unknown',
    severity: f.priority?.name || 'Unknown',
    status: f.status?.name || 'Unknown',
    created: f.created || '',
    updated: f.updated || '',
    resolutionDate: f.resolutiondate || '',
    labels: (f.labels || []).join(', '),
    components: (f.components || []).map((c) => c.name).join(', '),
    fixVersions: (f.fixVersions || []).map((v) => v.name).join(', '),
    sprint: Array.isArray(f.customfield_10020)
      ? f.customfield_10020.map((s) => s.name).join(', ')
      : '',
    storyPoints: f.customfield_10016 ?? f.customfield_10002 ?? '',
    issueType: f.issuetype?.name || '',
    resolutionNotes: f.resolution?.name || '',
    rootCause: f.customfield_15048 || '',
    commentsText,
    jiraUrl: `${baseUrl}/browse/${issue.key}`,
  };
}

export async function fetchAllBugs(jiraFetch, config) {
  const allIssues = [];
  let startAt = 0;
  const maxResults = 100;
  const jql = `project = ${config.project} AND issuetype = Bug ORDER BY updated DESC`;

  while (true) {
    const data = await jiraFetch('/rest/api/2/search', {
      jql,
      startAt,
      maxResults,
      expand: 'renderedFields',
      fields: [
        'summary', 'description', 'issuetype', 'status', 'priority', 'reporter', 'assignee',
        'created', 'updated', 'resolutiondate', 'labels', 'components', 'fixVersions', 'project',
        'resolution', 'customfield_15048', 'customfield_10020', 'customfield_10016', 'customfield_10002',
      ].join(','),
    });

    allIssues.push(...(data.issues || []));
    if (startAt + (data.issues?.length || 0) >= data.total) break;
    startAt += data.issues?.length || 0;
  }

  const normalized = [];
  for (const issue of allIssues) {
    let comments = [];
    try {
      const commentData = await jiraFetch(`/rest/api/2/issue/${issue.key}/comment`, { maxResults: 50 });
      comments = commentData.comments || [];
    } catch {
      comments = [];
    }
    normalized.push(normalizeJiraIssue(issue, config.baseUrl, comments));
  }

  return normalized;
}

export function buildInsights(records, kb) {
  const open = records.filter((r) => !['Done', 'Closed', 'Resolved'].includes(r.status));
  const critical = open.filter((r) => ['Critical', 'Highest', 'Blocker', 'High'].includes(r.priority));

  const moduleCounts = new Map();
  records.forEach((r) => {
    const mods = r.components ? r.components.split(', ').filter(Boolean) : ['General'];
    mods.forEach((m) => moduleCounts.set(m, (moduleCounts.get(m) || 0) + 1));
  });

  const reporterCounts = new Map();
  records.forEach((r) => reporterCounts.set(r.reporter, (reporterCounts.get(r.reporter) || 0) + 1));

  const labelCounts = new Map();
  records.forEach((r) => {
    r.labels.split(', ').filter((l) => l && l !== 'None').forEach((l) => {
      labelCounts.set(l, (labelCounts.get(l) || 0) + 1);
    });
  });

  const recentSimilar = kb.search('export ui chart alignment login failure checkout payment', 5);

  const repeated = [...labelCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  const topModules = [...moduleCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  return {
    potentialDuplicates: recentSimilar.filter((s) => s.similarity >= 80).length,
    mostRepeatedIssues: repeated,
    topProblemModules: topModules,
    aiRiskDetection: critical.length,
    recentlySimilarBugs: recentSimilar,
    criticalOpen: critical.slice(0, 10),
    topReporters: [...reporterCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count })),
  };
}

export function buildSummary(records, period = 'daily') {
  const now = new Date();
  const cutoff = new Date(now);
  if (period === 'daily') cutoff.setDate(now.getDate() - 1);
  else if (period === 'weekly') cutoff.setDate(now.getDate() - 7);
  else cutoff.setDate(now.getDate() - 14);

  const inPeriod = records.filter((r) => new Date(r.created) >= cutoff);
  const closedInPeriod = records.filter((r) => r.resolutionDate && new Date(r.resolutionDate) >= cutoff);
  const critical = inPeriod.filter((r) => ['Critical', 'Highest', 'Blocker'].includes(r.priority));

  const areas = new Map();
  inPeriod.forEach((r) => {
    const area = r.labels.split(', ')[0] || r.components.split(', ')[0] || 'General';
    areas.set(area, (areas.get(area) || 0) + 1);
  });

  return {
    period,
    generatedAt: now.toISOString(),
    newBugs: inPeriod.length,
    closedBugs: closedInPeriod.length,
    criticalBugs: critical.length,
    topProblemAreas: [...areas.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count })),
    trend: `${inPeriod.length} new vs ${closedInPeriod.length} closed in selected period`,
    criticalList: critical.slice(0, 10).map((r) => ({ key: r.key, summary: r.summary, status: r.status })),
  };
}

export async function generateChatResponse(query, kb, records, openaiClient = null) {
  const matches = kb.search(query, 8);
  const context = matches
    .map((m) => `- ${m.key}: ${m.summary} [${m.status}, ${m.priority}, similarity ${m.similarity}%]`)
    .join('\n');

  if (openaiClient) {
    try {
      const completion = await openaiClient.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a Jira Bug Intelligence Agent. Answer using only the provided Jira bug context. Cite ticket IDs.',
          },
          {
            role: 'user',
            content: `Question: ${query}\n\nRelevant Jira bugs:\n${context || 'No close matches.'}`,
          },
        ],
        temperature: 0.2,
      });
      return {
        answer: completion.choices[0]?.message?.content || 'No response generated.',
        matches,
        source: 'openai',
      };
    } catch {
      // fall through to local RAG
    }
  }

  const lower = query.toLowerCase();
  let answer = '';

  if (lower.includes('recurring') || lower.includes('top')) {
    const labels = new Map();
    records.forEach((r) => r.labels.split(', ').filter(Boolean).forEach((l) => labels.set(l, (labels.get(l) || 0) + 1)));
    const top = [...labels.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    answer = `Top recurring bug themes: ${top.map(([l, c]) => `${l} (${c})`).join(', ') || 'No label patterns yet.'}`;
  } else if (lower.includes('critical') && lower.includes('open')) {
    const critical = records.filter((r) => ['Critical', 'Highest', 'Blocker', 'High'].includes(r.priority) && !['Done', 'Closed', 'Resolved'].includes(r.status));
    answer = critical.length
      ? `Critical/high open bugs: ${critical.slice(0, 8).map((r) => r.key).join(', ')}`
      : 'No critical open bugs found in current sync.';
  } else if (lower.includes('reporter')) {
    const map = new Map();
    records.forEach((r) => map.set(r.reporter, (map.get(r.reporter) || 0) + 1));
    const top = [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    answer = `Top reporters: ${top.map(([n, c]) => `${n} (${c})`).join(', ')}`;
  } else if (matches.length) {
    answer = `Found ${matches.length} similar bug(s). Best match: ${matches[0].key} (${matches[0].similarity}% - ${classifyMatch(matches[0].similarity)}). ${duplicateRecommendation(matches[0].similarity).message}`;
  } else {
    answer = 'No similar bugs found in the current knowledge base. This may be a new issue area.';
  }

  return { answer, matches, source: 'local-rag' };
}

export function creationAssist(input, kb, records) {
  return runCreationAssist(input, kb, records);
}
