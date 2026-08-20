import { AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { BugRecord } from '@/types/jira';
import { CRITICAL_PRIORITIES, OPEN_STATUSES } from '@/types/jira';

interface NotificationsProps {
  bugs: BugRecord[];
  previousCount?: number;
}

export function Notifications({ bugs, previousCount }: NotificationsProps) {
  const critical = bugs.filter((b) => CRITICAL_PRIORITIES.includes(b.priority));
  const blocked = bugs.filter((b) => b.status.toLowerCase().includes('block'));
  const increased = previousCount != null && bugs.length > previousCount;

  const alerts = [
    critical.length ? `${critical.length} critical bug(s) require attention.` : null,
    blocked.length ? `${blocked.length} blocked bug(s) detected.` : null,
    increased ? `Bug count increased from ${previousCount} to ${bugs.length}.` : null,
    bugs.filter((b) => OPEN_STATUSES.includes(b.status)).length > 20
      ? 'High open bug volume detected.'
      : null,
  ].filter(Boolean);

  if (!alerts.length) return null;

  return (
    <Card className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/30">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 text-orange-600" size={20} />
        <div>
          <h3 className="font-semibold text-orange-800 dark:text-orange-200">Alerts</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-orange-700 dark:text-orange-300">
            {alerts.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}
