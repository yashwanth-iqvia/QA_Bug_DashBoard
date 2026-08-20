import type { BugRecord } from '@/types/jira';

/** QA team members — reporter name matched case-insensitively if it contains any of these */
export const QA_MEMBERS = ['adhesh', 'darwin', 'yashwanth'];

/** Standard label categories always shown in filter */
export const STANDARD_LABELS = ['UI', 'Export', 'Data'];

export function isQaReporter(reporter: string): boolean {
  const lower = reporter.toLowerCase();
  return QA_MEMBERS.some((name) => lower.includes(name));
}

export function getReporterTeam(reporter: string): 'qa' | 'others' {
  return isQaReporter(reporter) ? 'qa' : 'others';
}

/** Infer label from summary prefix when Jira label is missing (UI -, Export -, Data -) */
export function getEffectiveLabels(bug: BugRecord): string[] {
  const fromJira = bug.labels
    .split(', ')
    .map((l) => l.trim())
    .filter((l) => l && l !== 'None');

  if (fromJira.length) return fromJira;

  const summary = bug.summary.toLowerCase();
  if (summary.startsWith('data -') || summary.startsWith('data-')) return ['Data'];
  if (summary.startsWith('export -') || summary.startsWith('export-')) return ['Export'];
  if (summary.startsWith('ui -') || summary.startsWith('ui/') || summary.startsWith('ui-')) return ['UI'];

  return [];
}

/** All label options: standard UI/Export/Data + any labels from loaded bugs */
export function getLabelOptions(bugs: BugRecord[]): string[] {
  const dynamic = bugs.flatMap((b) => getEffectiveLabels(b));
  return [...new Set([...STANDARD_LABELS, ...dynamic])].sort((a, b) => {
    const order = STANDARD_LABELS.indexOf(a) - STANDARD_LABELS.indexOf(b);
    if (order !== 0) return order === 0 ? a.localeCompare(b) : order;
    return a.localeCompare(b);
  });
}

export function uniqueFieldValues(bugs: BugRecord[], field: keyof BugRecord): string[] {
  return [...new Set(bugs.map((b) => String(b[field] || '')).filter(Boolean))].sort();
}

export function uniqueReporters(bugs: BugRecord[]): string[] {
  return uniqueFieldValues(bugs, 'reporter');
}
