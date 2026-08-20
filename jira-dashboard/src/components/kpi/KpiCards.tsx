import { Card } from '@/components/ui/Card';
import type { BugRecord } from '@/types/jira';
import { CRITICAL_PRIORITIES, OPEN_STATUSES } from '@/types/jira';

interface KpiCardsProps {
  allIssues: BugRecord[];
  bugs: BugRecord[];
}

const kpis = [
  { key: 'totalTickets', label: 'Total Tickets', color: 'border-l-blue-500' },
  { key: 'totalBugs', label: 'Total Bugs', color: 'border-l-indigo-500' },
  { key: 'openBugs', label: 'Open Bugs', color: 'border-l-open' },
  { key: 'inProgress', label: 'In Progress Bugs', color: 'border-l-orange-500' },
  { key: 'resolved', label: 'Resolved Bugs', color: 'border-l-green-500' },
  { key: 'closed', label: 'Closed Bugs', color: 'border-l-closed' },
  { key: 'critical', label: 'Critical Bugs', color: 'border-l-critical' },
  { key: 'high', label: 'High Priority Bugs', color: 'border-l-high' },
] as const;

export function KpiCards({ allIssues, bugs }: KpiCardsProps) {
  const values: Record<string, number> = {
    totalTickets: allIssues.length,
    totalBugs: bugs.length,
    openBugs: bugs.filter((b) => OPEN_STATUSES.includes(b.status)).length,
    inProgress: bugs.filter((b) => b.status === 'In Progress').length,
    resolved: bugs.filter((b) => b.status === 'Resolved' || b.status === 'Done').length,
    closed: bugs.filter((b) => b.status === 'Closed').length,
    critical: bugs.filter((b) => CRITICAL_PRIORITIES.includes(b.priority)).length,
    high: bugs.filter((b) => b.priority === 'High').length,
  };

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => (
        <Card key={kpi.key} className={`border-l-4 ${kpi.color}`}>
          <p className="text-sm text-slate-500 dark:text-slate-400">{kpi.label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{values[kpi.key]}</p>
        </Card>
      ))}
    </section>
  );
}
