import type { BugRecord } from '@/types/jira';
import type { CreationAssistResult } from '@/types/agent';
import { localSearchBugs } from '@/lib/localAgentSearch';
import { localAnalyzeDefect } from '@/lib/localDefectAnalysis';

const JIRA_PROJECT = 'BIIH';

function parseInput(input: Record<string, string>) {
  const combined = [input.bugNotes, input.description, input.title, input.cdomVsOa, input.comparison].filter(Boolean).join('\n');
  const catMatch = combined.match(/(?:cat\s*id|catid)[:\s#-]*(\d+)/i);
  const urls = combined.match(/https?:\/\/[^\s<>"']+/gi) || [];

  return {
    title: input.title || '',
    bugNotes: input.bugNotes || input.description || '',
    oaReportLink: input.oaReportLink || input.oaLink || urls[0] || '',
    screenshots: input.screenshots || '',
    cdomVsOa: input.cdomVsOa || input.comparison || '',
    jiraReferences: input.jiraReferences || '',
    catId: input.catId || catMatch?.[1] || '',
    impact: input.impact || '',
    expectedBehavior: input.expectedBehavior || input.cdom || '',
    actualBehavior: input.actualBehavior || input.oa || '',
    steps: input.steps || '',
    combined,
  };
}

function extractContext(parsed: ReturnType<typeof parseInput>) {
  const text = [parsed.title, parsed.bugNotes, parsed.cdomVsOa].join(' ').toLowerCase();
  let issueType = 'UI';
  if (/export|ppt|chart export/i.test(text)) issueType = 'Export';
  else if (/data|wrong data|percentage|decimal/i.test(text)) issueType = 'Data';
  else if (/excel|embedded/i.test(text)) issueType = 'Excel';

  let expectedBehavior = parsed.expectedBehavior;
  let actualBehavior = parsed.actualBehavior;
  if (parsed.cdomVsOa) {
    const cdom = parsed.cdomVsOa.match(/cdom[:\s-]+(.+?)(?:\n|oa[:|\s-]|$)/is);
    const oa = parsed.cdomVsOa.match(/oa[:\s-]+(.+)/is);
    if (!expectedBehavior && cdom) expectedBehavior = cdom[1].trim();
    if (!actualBehavior && oa) actualBehavior = oa[1].trim();
  }

  const impact = parsed.impact || (parsed.catId ? `CatID ${parsed.catId}` : '');

  return { issueType, expectedBehavior, actualBehavior, impact, catId: parsed.catId, oaReportUrl: parsed.oaReportLink };
}

function validate(context: ReturnType<typeof extractContext>, parsed: ReturnType<typeof parseInput>) {
  const missing: string[] = [];
  const questions: string[] = [];

  if (!context.impact && !parsed.catId) {
    missing.push('impact');
    questions.push('What is the impact scope? (e.g. CatID, chart type, legacy templates)');
  }
  if (!context.oaReportUrl) {
    missing.push('oaReportLink');
    questions.push('Please provide the OA report URL.');
  }
  if (!context.expectedBehavior) {
    missing.push('expectedBehavior');
    questions.push('What is the expected behavior per CDOM (master)?');
  }
  if (!context.actualBehavior) {
    missing.push('actualBehavior');
    questions.push('What is the actual behavior in OA?');
  }
  if (!parsed.bugNotes && !parsed.title) {
    missing.push('bugNotes');
    questions.push('Please provide bug notes or a summary.');
  }

  return { complete: missing.length === 0, missing, questions };
}

export function localCreationAssist(bugs: BugRecord[], input: Record<string, string>): CreationAssistResult {
  const parsed = parseInput(input);
  const context = extractContext(parsed);
  const validation = validate(context, parsed);
  const matches = localSearchBugs(bugs, [parsed.bugNotes, parsed.cdomVsOa, context.issueType].join(' '), 8);

  const defectAnalysis = localAnalyzeDefect(bugs, {
    issue: parsed.title || parsed.bugNotes.split('\n')[0],
    description: parsed.bugNotes,
    cdom: context.expectedBehavior,
    oa: context.actualBehavior,
    catId: context.catId,
    validationType: context.issueType,
  });

  const summary = parsed.title || `${context.issueType} - ${parsed.bugNotes.split('\n')[0]?.slice(0, 60) || 'Untitled'}`;

  return {
    ready: validation.complete && defectAnalysis.status === 'Genuine New Defect',
    validation,
    extracted: context,
    businessRules: {
      projectKey: JIRA_PROJECT,
      cdomIsExpected: true,
      oaIsProductUnderTest: true,
      titlePrefix: context.issueType,
    },
    message: validation.complete
      ? defectAnalysis.status === 'Genuine New Defect'
        ? 'All required fields present. Jira draft is ready.'
        : `${defectAnalysis.status}: ${defectAnalysis.recommendation}`
      : 'Missing required information. Please answer the follow-up questions.',
    duplicateCheck: {
      duplicate: defectAnalysis.status !== 'Genuine New Defect',
      title: defectAnalysis.status,
      message: defectAnalysis.recommendation,
      defectStatus: defectAnalysis.status,
      matchingTicket: defectAnalysis.matchingTicket,
    },
    similarBugs: matches,
    defectAnalysis,
    jiraDraft: {
      project: JIRA_PROJECT,
      issueType: 'Bug',
      summary: summary.startsWith(context.issueType) ? summary : `${context.issueType} - ${summary}`,
      description: [
        `Expected (CDOM): ${context.expectedBehavior || '—'}`,
        `Actual (OA): ${context.actualBehavior || '—'}`,
        `Impact: ${context.impact || '—'}`,
        `OA Link: ${context.oaReportUrl || '—'}`,
        parsed.bugNotes && `\nBug Notes:\n${parsed.bugNotes}`,
        parsed.cdomVsOa && `\nCDOM vs OA:\n${parsed.cdomVsOa}`,
      ].filter(Boolean).join('\n'),
      acceptanceCriteria: 'OA must match CDOM Export (master).',
      labels: [context.issueType === 'Excel' ? 'Export' : context.issueType],
      priority: context.issueType === 'Data' ? 'High' : 'Low',
    },
    recommendations: {
      labels: [context.issueType === 'Excel' ? 'Export' : context.issueType],
      priority: context.issueType === 'Data' ? 'High' : 'Low',
      severity: context.issueType === 'Data' ? 'High' : 'Low',
      assignee: matches[0]?.assignee || 'Unassigned',
      components: [],
      rootCausePatterns: matches.slice(0, 3).map((m) => m.summary),
      previousFixes: [],
      workarounds: matches.slice(0, 2).map((m) => `Review ${m.key}`),
    },
  };
}
