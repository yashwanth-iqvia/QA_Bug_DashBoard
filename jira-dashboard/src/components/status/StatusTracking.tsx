import { Card, CardTitle } from '@/components/ui/Card';
import type { BugRecord } from '@/types/jira';
import { STATUS_GROUPS } from '@/types/jira';

interface StatusTrackingProps {
  bugs: BugRecord[];
}

function mapStatus(status: string): string {
  const normalized = status.toLowerCase();
  if (normalized.includes('to do')) return 'To Do';
  if (normalized.includes('progress')) return 'In Progress';
  if (normalized.includes('test')) return 'Testing';
  if (normalized.includes('block')) return 'Blocked';
  if (normalized.includes('done') || normalized.includes('resolved')) return 'Resolved';
  if (normalized.includes('closed')) return 'Closed';
  if (normalized.includes('open')) return 'Open';
  return status;
}

export function StatusTracking({ bugs }: StatusTrackingProps) {
  const total = bugs.length || 1;
  const counts = STATUS_GROUPS.map((group) => ({
    name: group,
    count: bugs.filter((b) => mapStatus(b.status) === group || b.status === group).length,
  }));

  return (
    <Card>
      <CardTitle>Status Tracking</CardTitle>
      <div className="space-y-4">
        {counts.map((item) => {
          const pct = ((item.count / total) * 100).toFixed(1);
          return (
            <div key={item.name}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-200">{item.name}</span>
                <span className="text-slate-500">{item.count} ({pct}%)</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
