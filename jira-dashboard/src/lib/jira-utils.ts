import type { BugRecord, DashboardFilters, JiraIssue, ReporterStats } from '@/types/jira';
import { CRITICAL_PRIORITIES, OPEN_STATUSES, RESOLVED_STATUSES } from '@/types/jira';
import { getEffectiveLabels, getReporterTeam } from '@/lib/filter-utils';
import { daysBetween, stripHtml } from '@/lib/utils';

function fieldToText(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return '';
}

function userName(user?: { displayName?: string; name?: string } | null) {
  return user?.displayName || user?.name || 'Unassigned';
}

export function normalizeIssue(issue: JiraIssue, baseUrl: string): BugRecord {
  const f = issue.fields;
  let description = fieldToText(f.description);
  if (!description && issue.renderedFields?.description) {
    description = stripHtml(issue.renderedFields.description);
  }

  const sprintField = f.customfield_10020;
  const sprint = Array.isArray(sprintField)
    ? sprintField.map((s) => s.name).join(', ')
    : sprintField
      ? String(sprintField)
      : '—';

  const storyPoints = f.customfield_10016 ?? f.customfield_10002;

  return {
    id: issue.id,
    key: issue.key,
    summary: f.summary || '—',
    description: description || '—',
    acceptanceCriteria: fieldToText(f.customfield_15048) || 'Not Found',
    project: f.project?.key || '—',
    reporter: userName(f.reporter),
    assignee: userName(f.assignee),
    priority: f.priority?.name || '—',
    severity: f.priority?.name || '—',
    status: f.status?.name || '—',
    created: f.created || '',
    updated: f.updated || '',
    resolutionDate: f.resolutiondate || '',
    labels: (f.labels || []).join(', ') || 'None',
    sprint,
    storyPoints: storyPoints != null ? String(storyPoints) : '—',
    issueType: f.issuetype?.name || '—',
    jiraUrl: `${baseUrl}/browse/${issue.key}`,
  };
}

export function applyFilters(bugs: BugRecord[], filters: DashboardFilters): BugRecord[] {
  return bugs.filter((bug) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const hay = `${bug.key} ${bug.summary} ${bug.description} ${bug.labels} ${bug.reporter} ${bug.assignee}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (filters.project !== 'all' && bug.project !== filters.project) return false;
    if (filters.assignee !== 'all' && bug.assignee !== filters.assignee) return false;
    if (filters.reporter !== 'all' && bug.reporter !== filters.reporter) return false;
    if (filters.qaTeam === 'qa' && getReporterTeam(bug.reporter) !== 'qa') return false;
    if (filters.qaTeam === 'others' && getReporterTeam(bug.reporter) !== 'others') return false;
    if (filters.priority !== 'all' && bug.priority !== filters.priority) return false;
    if (filters.severity !== 'all' && bug.severity !== filters.severity) return false;
    if (filters.status !== 'all' && bug.status !== filters.status) return false;
    if (filters.labels !== 'all' && !getEffectiveLabels(bug).includes(filters.labels)) return false;
    if (filters.dateFrom && bug.created < filters.dateFrom) return false;
    if (filters.dateTo && bug.created > `${filters.dateTo}T23:59:59`) return false;

    if (filters.quickStatus === 'open' && !OPEN_STATUSES.includes(bug.status)) return false;
    if (filters.quickStatus === 'resolved' && !RESOLVED_STATUSES.includes(bug.status)) return false;
    if (filters.quickStatus === 'critical' && !CRITICAL_PRIORITIES.includes(bug.priority)) return false;
    if (filters.quickStatus === 'high' && bug.priority !== 'High') return false;

    return true;
  });
}

export function computeReporterStats(bugs: BugRecord[]): ReporterStats[] {
  const map = new Map<string, ReporterStats>();

  bugs.forEach((bug) => {
    const key = bug.reporter;
    const current = map.get(key) || {
      reporter: key,
      total: 0,
      open: 0,
      resolved: 0,
      critical: 0,
      avgResolutionDays: 0,
    };

    current.total += 1;
    if (OPEN_STATUSES.includes(bug.status)) current.open += 1;
    if (RESOLVED_STATUSES.includes(bug.status)) current.resolved += 1;
    if (CRITICAL_PRIORITIES.includes(bug.priority)) current.critical += 1;
    map.set(key, current);
  });

  bugs.forEach((bug) => {
    const days = daysBetween(bug.created, bug.resolutionDate);
    if (days == null) return;
    const stat = map.get(bug.reporter);
    if (!stat) return;
    stat.avgResolutionDays = ((stat.avgResolutionDays * (stat.resolved || 1)) + days) / (stat.resolved || 1);
  });

  return [...map.values()].sort((a, b) => b.total - a.total);
}

export function countByField(bugs: BugRecord[], field: keyof BugRecord) {
  const map = new Map<string, number>();
  bugs.forEach((b) => {
    const key = String(b[field] || 'Unknown');
    map.set(key, (map.get(key) || 0) + 1);
  });
  return [...map.entries()].map(([name, value]) => ({ name, value }));
}

export function trendByMonth(bugs: BugRecord[], field: 'created' | 'resolutionDate') {
  const map = new Map<string, number>();
  bugs.forEach((b) => {
    const date = b[field];
    if (!date) return;
    const month = date.slice(0, 7);
    map.set(month, (map.get(month) || 0) + 1);
  });
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, value]) => ({ name, value }));
}
