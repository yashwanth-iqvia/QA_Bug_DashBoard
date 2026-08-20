import { useEffect, useMemo, useRef, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { KpiCards } from '@/components/kpi/KpiCards';
import { BugAnalytics } from '@/components/charts/BugAnalytics';
import { ReporterAnalytics } from '@/components/reporter/ReporterAnalytics';
import { StatusTracking } from '@/components/status/StatusTracking';
import { AdvancedFilters } from '@/components/filters/AdvancedFilters';
import { BugTable } from '@/components/tables/BugTable';
import { ExportCenter } from '@/components/export/ExportCenter';
import { Notifications } from '@/components/notifications/Notifications';
import { AgentWidgets } from '@/components/agent/AgentWidgets';
import { BugAgentPanel, type AgentTab } from '@/components/agent/BugAgentPanel';
import { EmptyState, Skeleton } from '@/components/ui/Card';
import { useJiraIssues } from '@/hooks/useJiraIssues';
import { useBugAgent } from '@/hooks/useBugAgent';
import { applyFilters, computeReporterStats } from '@/lib/jira-utils';
import { defaultFilters, type DashboardFilters } from '@/types/jira';

const TEN_MINUTES = 10 * 60 * 1000;

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showExport, setShowExport] = useState(false);
  const [agentOpen, setAgentOpen] = useState(false);
  const [agentTab, setAgentTab] = useState<AgentTab>('chat');
  const [filters, setFilters] = useState<DashboardFilters>(defaultFilters);
  const [savedViewLoaded, setSavedViewLoaded] = useState(false);
  const previousCount = useRef<number>();

  const { bugs, allIssues, loading, error, syncedAt, refresh } = useJiraIssues(
    filters.issueType,
    autoRefresh ? TEN_MINUTES : 0,
  );

  const agent = useBugAgent(bugs, TEN_MINUTES);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const displayBugs = useMemo(() => {
    const source = filters.issueType === 'all' ? allIssues : bugs;
    return applyFilters(source, filters);
  }, [allIssues, bugs, filters]);

  const reporterStats = useMemo(() => computeReporterStats(displayBugs), [displayBugs]);

  useEffect(() => {
    if (!loading && bugs.length) {
      previousCount.current = bugs.length;
    }
  }, [loading, bugs.length]);

  const handleRefreshAll = async () => {
    await Promise.all([refresh(), agent.refreshAgent(true)]);
  };

  const handleDrillDown = (field: string, value: string) => {
    if (field === 'status') setFilters((f) => ({ ...f, status: value, quickStatus: 'all' }));
    if (field === 'priority') setFilters((f) => ({ ...f, priority: value, quickStatus: 'all' }));
    if (field === 'reporter') setFilters((f) => ({ ...f, reporter: value }));
    if (field === 'assignee') setFilters((f) => ({ ...f, assignee: value }));
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const saveView = () => {
    localStorage.setItem('jira-dashboard-view', JSON.stringify(filters));
    alert('Custom view saved.');
  };

  const loadView = () => {
    const raw = localStorage.getItem('jira-dashboard-view');
    if (!raw) {
      alert('No saved view found.');
      return;
    }
    setFilters(JSON.parse(raw));
    setSavedViewLoaded(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header
        darkMode={darkMode}
        onToggleDark={() => setDarkMode((d) => !d)}
        onRefresh={handleRefreshAll}
        onExport={() => setShowExport((s) => !s)}
        onToggleAgent={() => setAgentOpen((o) => !o)}
        agentOpen={agentOpen}
        loading={loading || agent.loading}
        syncedAt={syncedAt || agent.status?.lastIndexedAt || null}
        autoRefresh={autoRefresh}
        onToggleAutoRefresh={() => setAutoRefresh((a) => !a)}
      />

      <div className="flex">
        <main
          className={`min-w-0 flex-1 space-y-6 px-6 py-6 transition-all duration-300 ${
            agentOpen ? 'w-1/2 max-w-[50vw]' : 'w-full'
          }`}
        >
          {error && <EmptyState title="API Failure" description={error} />}

          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-28" />
              ))}
            </div>
          ) : (
            <>
              <Notifications bugs={displayBugs} previousCount={previousCount.current} />

              <AgentWidgets insights={agent.insights} status={agent.status} loading={agent.loading} />

              {agent.usingLocalFallback && (
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                  Agent using local search from loaded bugs. Restart the server (`npm run dev`) for full AI knowledge base sync.
                </p>
              )}

              <KpiCards allIssues={allIssues} bugs={filters.issueType === 'all' ? allIssues : bugs} />

              <AdvancedFilters
                filters={filters}
                bugs={filters.issueType === 'all' ? allIssues : bugs}
                onChange={setFilters}
                onSaveView={saveView}
                onLoadView={loadView}
              />

              {savedViewLoaded && (
                <p className="text-sm text-green-600 dark:text-green-400">Saved custom view loaded.</p>
              )}

              {showExport && (
                <ExportCenter
                  bugs={filters.issueType === 'all' ? allIssues : bugs}
                  filtered={displayBugs}
                  onClose={() => setShowExport(false)}
                />
              )}

              {displayBugs.length === 0 ? (
                <EmptyState title="No bugs found" description="Try adjusting filters or refresh data from Jira." />
              ) : (
                <>
                  <BugAnalytics bugs={displayBugs} onDrillDown={handleDrillDown} />
                  <ReporterAnalytics stats={reporterStats} />
                  <StatusTracking bugs={displayBugs} />
                  <BugTable bugs={displayBugs} />
                </>
              )}
            </>
          )}
        </main>

        <BugAgentPanel
          open={agentOpen}
          activeTab={agentTab}
          onTabChange={setAgentTab}
          onClose={() => setAgentOpen(false)}
          onRefresh={() => agent.refreshAgent(true)}
          agent={agent}
          loading={agent.loading}
        />
      </div>
    </div>
  );
}
