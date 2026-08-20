/**
 * Bug Creation Assistant Engine
 * Layers: User Input → Context Extraction → Business Rules → Missing Info Validator
 */

import { duplicateRecommendation } from './knowledgeBase.js';
import { analyzeDefect } from './defectIntelligence.js';

const JIRA_PROJECT = 'BIIH';
const URL_PATTERN = /https?:\/\/[^\s<>"']+/gi;
const CAT_ID_PATTERN = /(?:cat\s*id|catid)[:\s#-]*(\d+)/i;
const BIIH_PATTERN = /BIIH-\d+/gi;

/** Layer 1 — normalize all user inputs */
export function parseUserInput(input = {}) {
  const combined = [
    input.bugNotes,
    input.description,
    input.title,
    input.steps,
    input.cdomVsOa,
    input.comparison,
    input.jiraReferences,
  ]
    .filter(Boolean)
    .join('\n');

  const urls = combined.match(URL_PATTERN) || [];
  const oaFromField = (input.oaReportLink || input.oaLink || '').trim();
  const oaUrl = oaFromField || urls.find((u) => /oa|report|analytics|dashboard/i.test(u)) || urls[0] || '';

  const catFromField = (input.catId || input.catID || '').trim();
  const catMatch = combined.match(CAT_ID_PATTERN);
  const catId = catFromField || catMatch?.[1] || '';

  const jiraRefs = [
    ...(input.jiraReferences || '').match(BIIH_PATTERN) || [],
    ...combined.match(BIIH_PATTERN) || [],
  ];

  return {
    title: (input.title || '').trim(),
    bugNotes: (input.bugNotes || input.description || '').trim(),
    oaReportLink: oaUrl,
    screenshots: (input.screenshots || '').trim(),
    cdomVsOa: (input.cdomVsOa || input.comparison || '').trim(),
    jiraReferences: [...new Set(jiraRefs)].join(', '),
    steps: (input.steps || '').trim(),
    catId,
    impact: (input.impact || '').trim(),
    expectedBehavior: (input.expectedBehavior || input.cdom || '').trim(),
    actualBehavior: (input.actualBehavior || input.oa || '').trim(),
    combinedText: combined,
  };
}

/** Layer 2 — extract structured context from raw input */
export function extractContext(parsed) {
  const text = [
    parsed.title,
    parsed.bugNotes,
    parsed.cdomVsOa,
    parsed.steps,
    parsed.combinedText,
  ]
    .filter(Boolean)
    .join('\n')
    .toLowerCase();

  let issueType = 'UI';
  if (/^export\s*-|\bexport\b|ppt|powerpoint|chart export|line marker|y-axis/i.test(text)) issueType = 'Export';
  else if (/^data\s*-|\bdata\b|wrong data|missing product|indication|percentage|decimal|0%/i.test(text)) issueType = 'Data';
  else if (/excel|embedded|spreadsheet|cell|column sort/i.test(text)) issueType = 'Excel';
  else if (/^ui\s*-|\bui\b|tooltip|legend|alignment|x-axis|axis label|footer|header/i.test(text)) issueType = 'UI';

  let expectedBehavior = parsed.expectedBehavior;
  let actualBehavior = parsed.actualBehavior;

  if ((!expectedBehavior || !actualBehavior) && parsed.cdomVsOa) {
    const cdomOaMatch = parsed.cdomVsOa.match(/cdom[:\s-]+(.+?)(?:\n|oa[:|\s-]+|$)/is);
    const oaMatch = parsed.cdomVsOa.match(/oa[:\s-]+(.+)/is);
    if (!expectedBehavior && cdomOaMatch) expectedBehavior = cdomOaMatch[1].trim();
    if (!actualBehavior && oaMatch) actualBehavior = oaMatch[1].trim();
  }

  if ((!expectedBehavior || !actualBehavior) && parsed.bugNotes) {
    const expMatch = parsed.bugNotes.match(/expected[:\s-]+(.+?)(?:\n|actual[:|\s-]|$)/is);
    const actMatch = parsed.bugNotes.match(/actual[:\s-]+(.+)/is);
    if (!expectedBehavior && expMatch) expectedBehavior = expMatch[1].trim();
    if (!actualBehavior && actMatch) actualBehavior = actMatch[1].trim();
  }

  let impact = parsed.impact;
  if (!impact) {
    const impactMatch = parsed.bugNotes.match(/impact[:\s-]+(.+?)(?:\n|$)/is)
      || parsed.cdomVsOa.match(/impact[:\s-]+(.+?)(?:\n|$)/is);
    if (impactMatch) impact = impactMatch[1].trim();
  }
  if (!impact && parsed.catId) impact = `CatID ${parsed.catId}`;

  return {
    issueType,
    expectedBehavior: expectedBehavior || '',
    actualBehavior: actualBehavior || '',
    impact: impact || '',
    catId: parsed.catId,
    oaReportUrl: parsed.oaReportLink,
    jiraReferences: parsed.jiraReferences,
    hasScreenshots: Boolean(parsed.screenshots),
    screenshotNotes: parsed.screenshots,
  };
}

/** Layer 3 — domain business rules */
export function applyBusinessRules(context, parsed) {
  return {
    projectKey: JIRA_PROJECT,
    cdomIsExpected: true,
    oaIsProductUnderTest: true,
    expectedSource: context.expectedBehavior ? 'CDOM (Master)' : 'Not provided — CDOM is master reference',
    actualSource: context.actualBehavior ? 'OA (Product under investigation)' : 'Not provided — OA is product under test',
    mandatoryImpact: true,
    mandatoryOaLink: true,
    mandatoryExpectedActual: true,
    titlePrefix: context.issueType,
  };
}

/** Layer 4 — missing information validator */
export function validateMissingInfo(context, parsed) {
  const missing = [];
  const questions = [];

  if (!context.impact && !parsed.impact && !parsed.catId) {
    missing.push('impact');
    questions.push('What is the impact scope? (e.g. CatID 1542, all legacy templates, specific chart type)');
  }

  if (!context.oaReportUrl) {
    missing.push('oaReportLink');
    questions.push('Please provide the OA report URL so the team can reproduce the issue.');
  }

  if (!context.expectedBehavior) {
    missing.push('expectedBehavior');
    questions.push('What is the expected behavior per CDOM (master)? Describe what CDOM Export shows.');
  }

  if (!context.actualBehavior) {
    missing.push('actualBehavior');
    questions.push('What is the actual behavior in OA? Describe what OA UI/Export/Excel shows.');
  }

  if (!parsed.title && !parsed.bugNotes) {
    missing.push('bugNotes');
    questions.push('Please provide bug notes or a short issue summary.');
  }

  return {
    complete: missing.length === 0,
    missing,
    questions,
  };
}

function inferTitle(context, parsed) {
  if (parsed.title) return parsed.title.startsWith(context.issueType) ? parsed.title : `${context.issueType} - ${parsed.title}`;
  const snippet = (parsed.bugNotes || parsed.cdomVsOa || '').split('\n')[0].slice(0, 80);
  return `${context.issueType} - ${snippet || 'Untitled defect'}`;
}

function buildDescription(context, parsed, rules) {
  const lines = [
    `*Project:* ${rules.projectKey}`,
    '',
    '*Expected Behavior (CDOM — Master):*',
    context.expectedBehavior || '_Not specified_',
    '',
    '*Actual Behavior (OA — Product under investigation):*',
    context.actualBehavior || '_Not specified_',
    '',
    '*Impact:*',
    context.impact || '_Not specified_',
    '',
    '*OA Report Link:*',
    context.oaReportUrl || '_Not provided_',
  ];

  if (context.catId) {
    lines.push('', `*CatID:* ${context.catId}`);
  }

  if (parsed.cdomVsOa) {
    lines.push('', '*CDOM vs OA Comparison:*', parsed.cdomVsOa);
  }

  if (parsed.bugNotes) {
    lines.push('', '*Bug Notes:*', parsed.bugNotes);
  }

  if (parsed.screenshots) {
    lines.push('', '*Screenshots / Evidence:*', parsed.screenshots);
  }

  if (context.jiraReferences) {
    lines.push('', '*Related Jira:*', context.jiraReferences);
  }

  if (parsed.steps) {
    lines.push('', '*Steps to Reproduce:*', parsed.steps);
  }

  return lines.join('\n');
}

function buildAcceptanceCriteria(context) {
  return [
    'OA behavior must match CDOM Export (master reference).',
    context.expectedBehavior ? `Expected: ${context.expectedBehavior}` : null,
    context.actualBehavior ? `Fix: OA should display ${context.expectedBehavior || 'CDOM-equivalent output'}` : null,
    context.catId ? `Validate on CatID ${context.catId}.` : null,
  ]
    .filter(Boolean)
    .join('\n');
}

/** Full pipeline */
export function runCreationAssist(input, kb, records) {
  const parsed = parseUserInput(input);
  const context = extractContext(parsed);
  const rules = applyBusinessRules(context, parsed);
  const validation = validateMissingInfo(context, parsed);

  const searchText = [
    parsed.title,
    parsed.bugNotes,
    parsed.cdomVsOa,
    context.expectedBehavior,
    context.actualBehavior,
    context.issueType,
  ]
    .filter(Boolean)
    .join(' ');

  const matches = kb.search(searchText, 8);
  const top = matches[0];
  const rec = duplicateRecommendation(top?.similarity || 0);

  const defectAnalysis = analyzeDefect(
    {
      issue: parsed.title || parsed.bugNotes.split('\n')[0] || '',
      description: parsed.bugNotes,
      cdom: context.expectedBehavior,
      oa: context.actualBehavior,
      catId: context.catId,
      validationType: context.issueType === 'Excel' ? 'Excel' : context.issueType,
    },
    records,
    kb,
  );

  const labelCounts = new Map();
  matches.forEach((m) => {
    m.labels.split(', ').filter((l) => l && l !== 'None').forEach((l) => labelCounts.set(l, (labelCounts.get(l) || 0) + 1));
  });

  const assigneeCounts = new Map();
  matches.forEach((m) => {
    if (m.assignee && m.assignee !== 'Unassigned') {
      assigneeCounts.set(m.assignee, (assigneeCounts.get(m.assignee) || 0) + 1);
    }
  });

  const priorityCounts = new Map();
  matches.forEach((m) => priorityCounts.set(m.priority, (priorityCounts.get(m.priority) || 0) + 1));

  const issueLabel = context.issueType === 'Excel' ? 'Export' : context.issueType;
  const suggestedLabels = [...labelCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2).map(([l]) => l);
  if (!suggestedLabels.includes(issueLabel)) suggestedLabels.unshift(issueLabel);

  const jiraDraft = {
    project: rules.projectKey,
    issueType: 'Bug',
    summary: inferTitle(context, parsed),
    description: buildDescription(context, parsed, rules),
    acceptanceCriteria: buildAcceptanceCriteria(context),
    labels: suggestedLabels.filter(Boolean),
    priority: context.issueType === 'Data' ? 'High' : defectAnalysis.priority || 'Low',
  };

  return {
    ready: validation.complete && defectAnalysis.status === 'Genuine New Defect',
    validation,
    extracted: context,
    businessRules: rules,
    duplicateCheck: {
      ...rec,
      defectStatus: defectAnalysis.status,
      defectRecommendation: defectAnalysis.recommendation,
      matchingTicket: defectAnalysis.matchingTicket,
    },
    similarBugs: matches,
    defectAnalysis,
    jiraDraft,
    recommendations: {
      labels: jiraDraft.labels,
      priority: jiraDraft.priority,
      severity: jiraDraft.priority,
      assignee: [...assigneeCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unassigned',
      components: [],
      rootCausePatterns: matches.slice(0, 3).map((m) => m.summary),
      previousFixes: records
        .filter((r) => ['Done', 'Resolved', 'Closed'].includes(r.status) && matches.some((x) => x.key === r.key))
        .map((r) => r.key),
      workarounds: matches.filter((m) => m.status !== 'Done').slice(0, 3).map((m) => `Review ${m.key}: ${m.summary}`),
    },
    message: validation.complete
      ? defectAnalysis.status === 'Genuine New Defect'
        ? 'All required fields present. Jira draft is ready for creation.'
        : `${defectAnalysis.status}: ${defectAnalysis.recommendation}`
      : 'Missing required information. Please answer the follow-up questions below.',
  };
}
