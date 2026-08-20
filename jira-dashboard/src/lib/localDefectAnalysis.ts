import type { BugRecord } from '@/types/jira';
import type { DefectAnalysisResult, DefectBatchResult } from '@/types/agent';
import { localSearchBugs } from '@/lib/localAgentSearch';

const PARENT_MAP: { keywords: string[]; tickets: string[]; name: string }[] = [
  { keywords: ['x axis', 'x-axis', 'tick', 'month format', 'n/dr', 'single line', 'multi-line'], tickets: ['BIIH-149', 'BIIH-163'], name: 'Axis Parent Bug' },
  { keywords: ['tooltip', 'missing %', 'missing n', 'missing dr'], tickets: ['BIIH-150', 'BIIH-158', 'BIIH-170'], name: 'Tooltip Parent Bug' },
  { keywords: ['header', 'metadata', 'month text'], tickets: ['BIIH-153'], name: 'Header Metadata Parent Bug' },
  { keywords: ['alignment', 'footer position', 'key takeaway'], tickets: ['BIIH-178'], name: 'Alignment Parent Bug' },
  { keywords: ['line marker', 'y-axis line'], tickets: ['BIIH-179'], name: 'Export Parent Bug' },
  { keywords: ['excel', 'embedded', 'percentage', 'rounding', 'decimal'], tickets: ['BIIH-162', 'BIIH-166', 'BIIH-171'], name: 'Embedded Excel Parent Bug' },
  { keywords: ['pie', 'donut', 'month year'], tickets: ['BIIH-151'], name: 'Pie Chart Parent Bug' },
];

function detectComponent(text: string) {
  const lower = text.toLowerCase();
  if (/x[\s-]?axis|tick|n\/dr/i.test(lower)) return 'X-Axis';
  if (/tooltip/i.test(lower)) return 'Tooltip';
  if (/legend/i.test(lower)) return 'Legend';
  if (/header|metadata/i.test(lower)) return 'Header';
  if (/excel|embedded/i.test(lower)) return 'Embedded Excel';
  if (/alignment|footer/i.test(lower)) return 'Alignment';
  return 'General';
}

function isEquivalent(cdom: string, oa: string) {
  const parse = (v: string) => parseFloat(v.replace(/%/g, ''));
  const a = parse(cdom);
  const b = parse(oa);
  if (Number.isNaN(a) || Number.isNaN(b)) return false;
  if (Math.abs(a - b * 100) < 0.05 || Math.abs(a / 100 - b) < 0.0005) return true;
  if (Math.abs(Math.round(a) - b) < 0.01) return true;
  return false;
}

function findParent(text: string) {
  const lower = text.toLowerCase();
  return PARENT_MAP.find((p) => p.keywords.some((k) => lower.includes(k)));
}

function statusFromScore(score: number, hasParent: boolean): DefectAnalysisResult['status'] {
  if (score >= 90) return 'Already Logged';
  if (score >= 80) return 'Duplicate of Existing Issue';
  if (score >= 70 || hasParent) return 'Covered By Parent Defect';
  if (score >= 60) return 'Covered by Existing Jira';
  return 'Genuine New Defect';
}

export function localAnalyzeDefect(
  bugs: BugRecord[],
  input: {
    issue?: string;
    description?: string;
    cdom?: string;
    oa?: string;
    catId?: string;
    validationType?: string;
  },
): DefectAnalysisResult {
  const { issue = '', description = '', cdom = '', oa = '', catId = '', validationType = 'UI' } = input;
  const text = [validationType, issue, description].join(' ').toLowerCase();
  const component = detectComponent(text);
  const category = validationType === 'Excel' ? 'Export' : validationType;

  if (validationType === 'Data' && cdom && oa && isEquivalent(cdom, oa)) {
    return {
      status: 'Known DEV Issue',
      confidence: 'High',
      matchingTicket: 'DEV-002',
      category,
      component,
      cdom,
      oa,
      issue,
      similarityScore: 100,
      tier: 'DEV Known Issue',
      reason: 'Values mathematically equivalent (35.61% = 0.3561). No data defect.',
      recommendation: 'Do Not Raise.',
    };
  }

  const parent = findParent(text);
  const matches = localSearchBugs(bugs, text, 3);
  const top = matches[0];
  const score = top?.similarity || (parent ? 72 : 0);
  const status = statusFromScore(score, Boolean(parent));
  const ticket = top?.key || parent?.tickets[0] || null;

  if (status === 'Genuine New Defect') {
    return {
      status,
      confidence: 'High',
      matchingTicket: null,
      category,
      component,
      cdom,
      oa,
      issue,
      similarityScore: score,
      tier: 'Candidate New Defect',
      title: `${category} - ${issue}`.trim(),
      impact: catId ? `CatID ${catId}` : 'Verify affected CatIDs',
      priority: category === 'Data' ? 'High' : 'Medium',
      reason: 'Similarity below 70%. No parent or Jira match.',
      recommendation: 'Proceed with new Jira defect creation.',
    };
  }

  return {
    status,
    confidence: score >= 85 ? 'High' : 'Medium',
    matchingTicket: ticket,
    category,
    component,
    cdom,
    oa,
    issue,
    similarityScore: score,
    tier: score >= 90 ? 'Same Defect' : score >= 80 ? 'Likely Duplicate' : 'Parent Issue Match',
    reason: parent
      ? `Parent family: ${parent.name} (${parent.tickets.join(', ')})`
      : `Matches "${top?.summary}" (${score}%)`,
    recommendation: catId ? `Add CAT-ID ${catId} to ${ticket}. Do Not Raise New Defect.` : `Add CAT-ID to ${ticket}. Do Not Raise.`,
    relatedTicket: top ? { key: top.key, summary: top.summary, status: top.status, jiraUrl: top.jiraUrl } : undefined,
    parentFamily: parent?.name,
  };
}

export function localAnalyzeBatch(
  bugs: BugRecord[],
  issues: Array<{ issue: string; description?: string; cdom?: string; oa?: string; validationType?: string }>,
  catId = '',
): DefectBatchResult {
  const results = issues.map((item) => ({
    ...localAnalyzeDefect(bugs, { ...item, catId }),
    issue: item.issue,
  }));

  const raise = results.filter((r) => r.status === 'Genuine New Defect');
  const doNotRaise = results.filter((r) => r.status !== 'Genuine New Defect');

  return {
    results,
    summary: {
      total: results.length,
      alreadyLogged: results.filter((r) => r.status === 'Already Logged').length,
      covered: results.filter((r) => r.status.includes('Covered')).length,
      knownIssue: results.filter((r) => r.status === 'Known DEV Issue').length,
      newDefects: raise.length,
    },
    finalRecommendation: {
      doNotRaise: doNotRaise.map((r) => r.issue || `${r.component}: ${r.issue}`),
      raise: raise.map((r) => r.title || r.issue || ''),
    },
  };
}
