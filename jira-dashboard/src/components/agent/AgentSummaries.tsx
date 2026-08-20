import { useEffect, useState } from 'react';
import { AgentPanelShell } from '@/components/agent/BugAgentPanel';
import { Button, Card } from '@/components/ui/Card';
import type { BugSummary } from '@/types/agent';

interface AgentSummariesProps {
  onSummary: (period: 'daily' | 'weekly' | 'sprint') => Promise<BugSummary>;
}

export function AgentSummaries({ onSummary }: AgentSummariesProps) {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'sprint'>('daily');
  const [summary, setSummary] = useState<BugSummary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    onSummary(period).then(setSummary).finally(() => setLoading(false));
  }, [period, onSummary]);

  return (
    <AgentPanelShell>
      <div className="mb-3 flex gap-2">
        {(['daily', 'weekly', 'sprint'] as const).map((p) => (
          <Button key={p} variant={period === p ? 'primary' : 'secondary'} onClick={() => setPeriod(p)}>
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </Button>
        ))}
      </div>

      {loading && <p className="text-sm text-slate-500">Generating AI summary...</p>}

      {summary && (
        <div className="space-y-3 overflow-y-auto">
          <Card className="p-4">
            <h3 className="font-semibold capitalize">{summary.period} Bug Summary</h3>
            <p className="text-xs text-slate-500">Generated {new Date(summary.generatedAt).toLocaleString()}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>New Bugs: <strong>{summary.newBugs}</strong></div>
              <div>Closed Bugs: <strong>{summary.closedBugs}</strong></div>
              <div>Critical Bugs: <strong>{summary.criticalBugs}</strong></div>
              <div>Trend: <strong>{summary.trend}</strong></div>
            </div>
          </Card>

          <Card className="p-4">
            <h4 className="font-medium">Top Problem Areas</h4>
            <ul className="mt-2 list-disc pl-5 text-sm">
              {summary.topProblemAreas.map((a) => (
                <li key={a.name}>{a.name}: {a.count}</li>
              ))}
            </ul>
          </Card>

          {summary.criticalList.length > 0 && (
            <Card className="p-4">
              <h4 className="font-medium">Critical Bugs</h4>
              <ul className="mt-2 space-y-1 text-sm">
                {summary.criticalList.map((b) => (
                  <li key={b.key}>{b.key} — {b.summary} ({b.status})</li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}
    </AgentPanelShell>
  );
}
