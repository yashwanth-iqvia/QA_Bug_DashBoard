import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar, type AppModule } from '@/components/layout/Sidebar';
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
import { ReleasesView } from '@/components/releases/ReleasesView';
import { EmptyState, Skeleton } from '@/components/ui/Card';
import { useJiraIssues } from '@/hooks/useJiraIssues';
import { useBugAgent } from '@/hooks/useBugAgent';
import { FIFTEEN_MINUTES_MS } from '@/hooks/useRefreshCountdown';
import { applyFilters, computeReporterStats } from '@/lib/jira-utils';
import { refreshAllJiraData } from '@/lib/queryClient';
import { STATIC_MODE } from '@/services/jira/apiBase';
import { clearStaticCache } from '@/services/jira/api';
import { defaultFilters, type DashboardFilters } from '@/types/jira';

const LIVE_REFRESH_MS = 10 * 60 * 1000;
const REFRESH_MS = STATIC_MODE ? FIFTEEN_MINUTES_MS : LIVE_REFRESH_MS;

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showExport, setShowExport] = useState(false);
  const [agentOpen, setAgentOpen] = useState(false);
  const [agentTab, setAgentTab] = useState<AgentTab>('chat');
  const [filters, setFilters] = useState<DashboardFilters>(defaultFilters);
  const [savedViewLoaded, setSavedViewLoaded] = useState(false);
  const [activeModule, setActiveModule] = useState<AppModule>('bugs');
  const [releaseRefreshToken, setReleaseRefreshToken] = useState(0);
  const [releaseSyncedAt, setReleaseSyncedAt] = useState<string | null>(null);
  const [releaseLoading, setReleaseLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshAt, setLastRefreshAt] = useState<number | null>(null);
  const previousCount = useRef<number>();

  const { bugs, allIssues, loading, isRefreshing, error, syncedAt, fetchedAt, refresh: refreshIssues } = useJiraIssues(
    filters.issueType,
    autoRefresh ? REFRESH_MS : 0,
  );

  const agent = useBugAgent(bugs, autoRefresh && !STATIC_MODE ? LIVE_REFRESH_MS : 0, syncedAt);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const dataAgeMinutes = syncedAt
    ? Math.floor((Date.now() - new Date(syncedAt).getTime()) / 60_000)
    : null;
  const isStaleData = STATIC_MODE && dataAgeMinutes !== null && dataAgeMinutes > 20;

  const displayBugs = useMemo(() => {
    const source = filters.issueType === 'all' ? allIssues : bugs;
    return applyFilters(source, filters);
  }, [allIssues, bugs, filters]);

  const reporterStats = useMemo(() => computeReporterStats(displayBugs), [displayBugs]);

  const headerSyncedAt =
    activeModule === 'releases' ? releaseSyncedAt : syncedAt;
  const headerLoading =
    activeModule === 'releases'
      ? releaseLoading
      : (loading && bugs.length === 0) || agent.loading || refreshing;

  const syncing = refreshing || isRefreshing;

  useEffect(() => {
    if (fetchedAt) setLastRefreshAt(fetchedAt);
  }, [fetchedAt]);

  useEffect(() => {
    if (!loading && bugs.length) {
      previousCount.current = bugs.length;
    }
  }, [loading, bugs.length]);

  const handleRefreshAll = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      if (STATIC_MODE) clearStaticCache();
      else await refreshAllJiraData();
      await Promise.all([refreshIssues(), agent.refreshAgent(true)]);
      setReleaseRefreshToken((t) => t + 1);
    } finally {
      setRefreshing(false);
    }
  }, [refreshing, refreshIssues, agent.refreshAgent]);

  const handleReleaseSyncedAt = useCallback((value: string | null) => {
    setReleaseSyncedAt(value);
  }, []);

  const handleReleaseLoading = useCallback((value: boolean) => {
    setReleaseLoading(value);
  }, []);

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
        loading={headerLoading}
        syncing={syncing}
        syncedAt={headerSyncedAt}
        autoRefresh={autoRefresh}
        onToggleAutoRefresh={() => setAutoRefresh((a) => !a)}
        lastRefreshAt={lastRefreshAt}
        refreshIntervalMs={REFRESH_MS}
      />

      <div className="flex">
        <Sidebar activeModule={activeModule} onNavigate={setActiveModule} />

        <main
          className={`min-w-0 flex-1 space-y-6 px-6 py-6 transition-all duration-300 ${
            agentOpen && activeModule === 'bugs' ? 'w-1/2 max-w-[50vw]' : 'w-full'
          }`}
        >
          {activeModule === 'releases' ? (
            <ReleasesView
              autoRefresh={autoRefresh}
              autoRefreshMs={REFRESH_MS}
              refreshToken={releaseRefreshToken}
              onSyncedAt={handleReleaseSyncedAt}
              onLoadingChange={handleReleaseLoading}
            />
          ) : (
            <>
              {error && <EmptyState title="Data unavailable" description={error} />}

              {isStaleData && (
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                  Jira data is {dataAgeMinutes} min old. GitHub Actions syncs from Jira every 15 min — run{' '}
                  <strong>Sync Jira Data</strong> in Actions if this stays stale. Click Refresh to reload the latest deployed JSON.
                </p>
              )}

              {STATIC_MODE && syncedAt && !error && !isStaleData && (
                <p className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-200">
                  GitHub Pages — Jira data pulled by GitHub Actions every 15 min. AI Agent searches this
                  dataset in your browser. Click Refresh to reload the latest deployed JSON.
                </p>
              )}

              {loading && bugs.length === 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-28" />
                  ))}
                </div>
              ) : (
                <>
                  <Notifications bugs={displayBugs} previousCount={previousCount.current} />

                  <AgentWidgets insights={agent.insights} status={agent.status} loading={agent.loading} syncedAt={syncedAt} />

                  {agent.usingLocalFallback && !STATIC_MODE && (
                    <p className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-200">
                      Agent using local search from loaded bugs. Restart the server (`npm run dev`) for full AI knowledge base sync.
                    </p>
                  )}

                  {agent.error && (
                    <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                      Agent unavailable: {agent.error}. Ensure the API server is running (`npm run dev`).
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
            </>
          )}
        </main>

        {activeModule === 'bugs' && (
          <BugAgentPanel
            open={agentOpen}
            activeTab={agentTab}
            onTabChange={setAgentTab}
            onClose={() => setAgentOpen(false)}
            onRefresh={() => handleRefreshAll()}
            agent={agent}
            loading={agent.loading || refreshing}
            dataSyncedAt={syncedAt}
          />
        )}
      </div>
    </div>
  );
}
