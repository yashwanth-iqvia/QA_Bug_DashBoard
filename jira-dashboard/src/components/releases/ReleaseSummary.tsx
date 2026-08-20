import { Card } from '@/components/ui/Card';
import type { ReleaseSummaryStats } from '@/types/releases';

const STATS: { key: keyof ReleaseSummaryStats; label: string; color: string }[] = [
  { key: 'totalStories', label: 'Total Stories', color: 'border-l-blue-500' },
  { key: 'totalSubtasks', label: 'Total Subtasks', color: 'border-l-indigo-500' },
  { key: 'completedStories', label: 'Completed Stories', color: 'border-l-green-500' },
  { key: 'inProgressStories', label: 'In Progress Stories', color: 'border-l-orange-500' },
  { key: 'pendingStories', label: 'Pending Stories', color: 'border-l-slate-400' },
];

export function ReleaseSummary({ summary }: { summary: ReleaseSummaryStats }) {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {STATS.map((stat) => (
        <Card key={stat.key} className={`border-l-4 ${stat.color}`}>
          <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{summary[stat.key]}</p>
        </Card>
      ))}
    </section>
  );
}
