import { RefreshCw, Download, Moon, Sun, Bug, ExternalLink, Bot, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Card';
import { ShareTeamDialog } from '@/components/layout/ShareTeamDialog';
import { formatDate } from '@/lib/utils';
import { STATIC_MODE } from '@/services/jira/apiBase';
import { formatCountdown } from '@/hooks/useRefreshCountdown';
import { useEffect, useState } from 'react';

interface HeaderProps {
  darkMode: boolean;
  onToggleDark: () => void;
  onRefresh: () => void;
  onExport: () => void;
  onToggleAgent: () => void;
  agentOpen: boolean;
  loading: boolean;
  syncedAt: string | null;
  autoRefresh: boolean;
  onToggleAutoRefresh: () => void;
  lastRefreshAt: number | null;
  refreshIntervalMs: number;
}

/** Isolated countdown — ticks every second without re-rendering the dashboard. */
function RefreshCountdown({
  enabled,
  lastRefreshAt,
  intervalMs,
}: {
  enabled: boolean;
  lastRefreshAt: number | null;
  intervalMs: number;
}) {
  const [label, setLabel] = useState(formatCountdown(Math.ceil(intervalMs / 1000)));

  useEffect(() => {
    if (!enabled || !lastRefreshAt) {
      setLabel(formatCountdown(Math.ceil(intervalMs / 1000)));
      return;
    }

    const tick = () => {
      const remaining = Math.max(0, intervalMs - (Date.now() - lastRefreshAt));
      setLabel(formatCountdown(Math.ceil(remaining / 1000)));
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [enabled, lastRefreshAt, intervalMs]);

  if (!enabled) return null;

  const minutes = intervalMs / 60_000;

  return (
    <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400">
      <Clock size={12} />
      Auto-refreshes every {minutes} min — Next in {label}
    </p>
  );
}

export function Header({
  darkMode,
  onToggleDark,
  onRefresh,
  onExport,
  onToggleAgent,
  agentOpen,
  loading,
  syncedAt,
  autoRefresh,
  onToggleAutoRefresh,
  lastRefreshAt,
  refreshIntervalMs,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-700 dark:bg-slate-950/95">
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
            <Bug size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">QA Bug Dashboard</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Last data pull: {syncedAt ? formatDate(syncedAt) : '—'}
              {STATIC_MODE && ' · GitHub Pages'}
            </p>
            <RefreshCountdown
              enabled={autoRefresh}
              lastRefreshAt={lastRefreshAt}
              intervalMs={refreshIntervalMs}
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant={agentOpen ? 'primary' : 'secondary'} onClick={onToggleAgent}>
            <Bot size={16} /> AI Agent
          </Button>
          <Button variant="ghost" onClick={onToggleAutoRefresh}>
            {autoRefresh ? 'Auto Refresh: ON' : 'Auto Refresh: OFF'}
          </Button>
          <Button variant="secondary" onClick={onRefresh} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </Button>
          <Button variant="secondary" onClick={onExport}>
            <Download size={16} /> Export
          </Button>
          <ShareTeamDialog />
          <Button variant="ghost" onClick={onToggleDark}>
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </Button>
          <a
            href="https://jiraims.rm.imshealth.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-slate-800"
          >
            Open Jira <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </header>
  );
}
