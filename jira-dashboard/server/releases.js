/**
 * Releases module — fetch BIIH Stories with CAT ID in summary + their Subtasks.
 *
 * Real Jira shape:
 *   key: BIIH-10
 *   summary: "OA Migration | CAT ID 1511 | Share of Attention - Indication Details"
 *   subtasks: BIIH-22, BIIH-23, BIIH-24
 */

const DEFAULT_RELEASES = [
  'Release 1 - Promo (GenMed, ONC and BISO)',
  'Release 2',
  'Release 3',
  'Future Releases',
];

const STORY_FIELDS = [
  'summary',
  'status',
  'assignee',
  'priority',
  'fixVersions',
  'project',
  'issuetype',
  'subtasks',
  'parent',
  'customfield_10020',
  'customfield_10016',
  'customfield_10002',
].join(',');

/** Matches "CAT ID 1511", "CAT-ID-1511", "CATID 1511" (ignores zero-width chars). */
const CAT_ID_RE = /CAT[\s\-]*ID[\s\-]*(\d+)/i;

function stripInvisible(text = '') {
  return String(text).replace(/[\u200B-\u200D\uFEFF]/g, '');
}

export function extractCatId(summary = '') {
  const cleaned = stripInvisible(summary);
  const match = cleaned.match(CAT_ID_RE);
  return match ? match[1] : null;
}

export function hasCatId(summary = '') {
  return Boolean(extractCatId(summary));
}

function userName(user) {
  return user?.displayName || user?.name || 'Unassigned';
}

function sprintName(field) {
  if (!Array.isArray(field) || !field.length) return '—';
  return field.map((s) => s?.name).filter(Boolean).join(', ') || '—';
}

function storyPoints(fields) {
  const pts = fields?.customfield_10016 ?? fields?.customfield_10002;
  return pts != null && pts !== '' ? String(pts) : '—';
}

function releaseNames(fields) {
  return (fields?.fixVersions || []).map((v) => v.name).filter(Boolean);
}

function normalizeSubtask(issue, baseUrl) {
  const f = issue.fields || {};
  const summary = stripInvisible(f.summary || '—');
  const catId = extractCatId(summary);
  return {
    key: issue.key,
    catId: catId || null,
    catIdLabel: catId ? `CAT-ID-${catId}` : null,
    summary,
    status: f.status?.name || 'Unknown',
    assignee: userName(f.assignee),
    priority: f.priority?.name || '—',
    jiraUrl: `${baseUrl}/browse/${issue.key}`,
  };
}

function normalizeStory(issue, baseUrl, subtasks = []) {
  const f = issue.fields || {};
  const summary = stripInvisible(f.summary || '—');
  const catId = extractCatId(summary);
  const releases = releaseNames(f);
  return {
    key: issue.key,
    catId: catId || null,
    catIdLabel: catId ? `CAT-ID-${catId}` : issue.key,
    summary,
    status: f.status?.name || 'Unknown',
    assignee: userName(f.assignee),
    priority: f.priority?.name || '—',
    sprint: sprintName(f.customfield_10020),
    release: releases.join(', ') || '—',
    storyPoints: storyPoints(f),
    jiraUrl: `${baseUrl}/browse/${issue.key}`,
    subtasks,
  };
}

async function jiraSearchAll(jiraFetch, jql, fields = STORY_FIELDS) {
  const allIssues = [];
  let startAt = 0;
  const maxResults = 100;

  while (true) {
    const data = await jiraFetch('/rest/api/2/search', {
      jql,
      startAt,
      maxResults,
      fields,
    });
    allIssues.push(...(data.issues || []));
    if (startAt + (data.issues?.length || 0) >= (data.total || 0)) break;
    startAt += data.issues?.length || 0;
    if (!data.issues?.length) break;
  }

  return allIssues;
}

function escapeJqlString(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

/**
 * List versions for release dropdown. Merges live project versions with defaults.
 */
export async function fetchReleaseVersions(jiraFetch, config) {
  const projectKeys = [
    process.env.JIRA_RELEASE_PROJECT,
    config.project,
    'BIIH',
  ].filter(Boolean);

  const versionMap = new Map();
  DEFAULT_RELEASES.forEach((name, i) => {
    versionMap.set(name, {
      id: `default-${i}`,
      name,
      released: false,
      archived: false,
      source: 'default',
    });
  });

  for (const projectKey of [...new Set(projectKeys)]) {
    try {
      const versions = await jiraFetch(`/rest/api/2/project/${encodeURIComponent(projectKey)}/versions`);
      (versions || []).forEach((v) => {
        if (!v?.name) return;
        versionMap.set(v.name, {
          id: String(v.id || v.name),
          name: v.name,
          released: Boolean(v.released),
          archived: Boolean(v.archived),
          releaseDate: v.releaseDate || null,
          source: 'jira',
        });
      });
    } catch {
      // Project may not exist — keep defaults
    }
  }

  const list = [...versionMap.values()].sort((a, b) => {
    const ai = DEFAULT_RELEASES.indexOf(a.name);
    const bi = DEFAULT_RELEASES.indexOf(b.name);
    if (ai !== -1 || bi !== -1) {
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    }
    return a.name.localeCompare(b.name);
  });

  return { versions: list, defaults: DEFAULT_RELEASES };
}

/**
 * Fetch Stories for a fix version that contain a CAT ID in the summary, plus Subtasks.
 */
export async function fetchReleaseStories(jiraFetch, config, versionName) {
  if (!versionName) {
    throw new Error('version query parameter is required');
  }

  const releaseProject = process.env.JIRA_RELEASE_PROJECT || config.project || 'BIIH';
  const version = escapeJqlString(versionName);
  const baseUrl = config.baseUrl;
  const projectEscaped = escapeJqlString(releaseProject);

  const usedJql = `project = "${projectEscaped}" AND issuetype = Story AND fixVersion = "${version}" ORDER BY key ASC`;
  let storyIssues = [];

  try {
    const issues = await jiraSearchAll(jiraFetch, usedJql);
    storyIssues = issues.filter((issue) => hasCatId(issue.fields?.summary || ''));
  } catch (err) {
    // Fallback without project constraint
    const fallbackJql = `issuetype = Story AND fixVersion = "${version}" ORDER BY key ASC`;
    const issues = await jiraSearchAll(jiraFetch, fallbackJql);
    storyIssues = issues.filter((issue) => hasCatId(issue.fields?.summary || ''));
  }

  // Sort by CAT ID number when available
  storyIssues.sort((a, b) => {
    const ca = Number(extractCatId(a.fields?.summary) || 0);
    const cb = Number(extractCatId(b.fields?.summary) || 0);
    if (ca !== cb) return ca - cb;
    return String(a.key).localeCompare(String(b.key));
  });

  const subtaskKeySet = new Set();
  const storyKeyList = storyIssues.map((s) => s.key);

  storyIssues.forEach((story) => {
    (story.fields?.subtasks || []).forEach((st) => {
      if (st?.key) subtaskKeySet.add(st.key);
    });
  });

  if (storyKeyList.length) {
    const chunkSize = 40;
    for (let i = 0; i < storyKeyList.length; i += chunkSize) {
      const chunk = storyKeyList.slice(i, i + chunkSize);
      const parentJql = `issuetype in (Sub-task, Subtask) AND parent in (${chunk.map((k) => `"${k}"`).join(',')})`;
      try {
        const childIssues = await jiraSearchAll(jiraFetch, parentJql);
        childIssues.forEach((c) => {
          if (c?.key) subtaskKeySet.add(c.key);
        });
      } catch {
        // use embedded subtasks
      }
    }
  }

  const subtaskByKey = new Map();

  storyIssues.forEach((story) => {
    (story.fields?.subtasks || []).forEach((st) => {
      if (!st?.key) return;
      subtaskByKey.set(st.key, normalizeSubtask(st, baseUrl));
    });
  });

  const subtaskKeys = [...subtaskKeySet];
  if (subtaskKeys.length) {
    const chunkSize = 50;
    for (let i = 0; i < subtaskKeys.length; i += chunkSize) {
      const chunk = subtaskKeys.slice(i, i + chunkSize);
      const jql = `issuekey in (${chunk.map((k) => `"${k}"`).join(',')})`;
      try {
        const issues = await jiraSearchAll(jiraFetch, jql);
        issues.forEach((issue) => {
          subtaskByKey.set(issue.key, {
            ...normalizeSubtask(issue, baseUrl),
            parentKey: issue.fields?.parent?.key || null,
          });
        });
      } catch {
        // keep embedded data
      }
    }
  }

  const parentToSubtasks = new Map();
  storyKeyList.forEach((k) => parentToSubtasks.set(k, []));

  storyIssues.forEach((story) => {
    const list = parentToSubtasks.get(story.key) || [];
    (story.fields?.subtasks || []).forEach((st) => {
      if (!st?.key) return;
      const full = subtaskByKey.get(st.key) || normalizeSubtask(st, baseUrl);
      if (!list.some((x) => x.key === full.key)) list.push(full);
    });
    parentToSubtasks.set(story.key, list);
  });

  subtaskByKey.forEach((sub, key) => {
    const parentKey = sub.parentKey;
    if (parentKey && parentToSubtasks.has(parentKey)) {
      const list = parentToSubtasks.get(parentKey);
      if (!list.some((x) => x.key === key)) {
        list.push({
          key: sub.key,
          catId: sub.catId,
          catIdLabel: sub.catIdLabel,
          summary: sub.summary,
          status: sub.status,
          assignee: sub.assignee,
          priority: sub.priority,
          jiraUrl: sub.jiraUrl,
        });
      }
    }
  });

  const stories = storyIssues.map((issue) =>
    normalizeStory(issue, baseUrl, parentToSubtasks.get(issue.key) || []),
  );

  const summary = {
    totalStories: stories.length,
    totalSubtasks: stories.reduce((n, s) => n + s.subtasks.length, 0),
    completedStories: stories.filter((s) => isCompletedStatus(s.status)).length,
    inProgressStories: stories.filter((s) => isInProgressStatus(s.status)).length,
    pendingStories: stories.filter((s) => isPendingStatus(s.status)).length,
  };

  return {
    version: versionName,
    jql: usedJql,
    baseUrl,
    syncedAt: new Date().toISOString(),
    summary,
    stories,
  };
}

function isCompletedStatus(status) {
  const s = (status || '').toLowerCase();
  return ['done', 'resolved', 'closed', 'completed'].includes(s);
}

function isInProgressStatus(status) {
  const s = (status || '').toLowerCase();
  return (
    s.includes('progress') ||
    s.includes('testing') ||
    s.includes('review') ||
    s.includes('uat') ||
    s === 'ready for test'
  );
}

function isPendingStatus(status) {
  if (isCompletedStatus(status) || isInProgressStatus(status)) return false;
  return true;
}

export { DEFAULT_RELEASES };
