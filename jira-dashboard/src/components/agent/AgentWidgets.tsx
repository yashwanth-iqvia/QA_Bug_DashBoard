import { Card, CardTitle, Skeleton } from '@/components/ui/Card';
import type { AgentInsights, AgentStatus } from '@/types/agent';
import { AlertTriangle, Copy, Layers, ShieldAlert, Sparkles } from 'lucide-react';

interface AgentWidgetsProps {
  insights: AgentInsights | null;
  status: AgentStatus | null;
  loading?: boolean;
}

export function AgentWidgets({ insights, status, loading }: AgentWidgetsProps) {
  if (loading && !insights) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
      </div>
    );
  }

  if (!insights) return null;

  const cards = [
    { title: 'Potential Duplicates', value: insights.potentialDuplicates, icon: Copy, color: 'text-orange-600' },
    { title: 'Most Repeated Issues', value: insights.mostRepeatedIssues[0]?.name || '—', sub: `${insights.mostRepeatedIssues[0]?.count || 0} bugs`, icon: Layers, color: 'text-blue-600' },
    { title: 'Top Problem Module', value: insights.topProblemModules[0]?.name || '—', sub: `${insights.topProblemModules[0]?.count || 0} bugs`, icon: AlertTriangle, color: 'text-purple-600' },
    { title: 'AI Risk Detection', value: insights.aiRiskDetection, sub: 'critical/high open', icon: ShieldAlert, color: 'text-red-600' },
    { title: 'KB Indexed Bugs', value: status?.indexed || 0, sub: status?.lastIndexedAt ? `Synced ${new Date(status.lastIndexedAt).toLocaleTimeString()}` : '', icon: Sparkles, color: 'text-green-600' },
  ];

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">AI Bug Intelligence</h2>
        <p className="text-xs text-slate-500">
          Provider: {status?.aiProvider || 'local-rag'} · Auto-refresh every {status?.refreshIntervalMinutes || 10} min
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        {cards.map((c) => (
          <Card key={c.title}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">{c.title}</p>
                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{c.value}</p>
                {c.sub && <p className="mt-1 text-xs text-slate-400">{c.sub}</p>}
              </div>
              <c.icon className={c.color} size={22} />
            </div>
          </Card>
        ))}
      </div>

      {insights.recentlySimilarBugs.length > 0 && (
        <Card>
          <CardTitle>Recently Similar Bugs</CardTitle>
          <div className="space-y-2">
            {insights.recentlySimilarBugs.map((b) => (
              <div key={b.key} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700">
                <div>
                  <a href={b.jiraUrl} target="_blank" rel="noreferrer" className="font-medium text-blue-600 hover:underline">{b.key}</a>
                  <p className="text-slate-600 dark:text-slate-300">{b.summary}</p>
                </div>
                <span className="text-xs text-slate-500">{b.similarity}% match</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </section>
  );
}
