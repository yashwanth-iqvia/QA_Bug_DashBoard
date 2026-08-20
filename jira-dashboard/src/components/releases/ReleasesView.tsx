import { useEffect, useMemo, useState } from 'react';
import { ReleaseSummary } from '@/components/releases/ReleaseSummary';
import { ReleaseToolbar } from '@/components/releases/ReleaseToolbar';
import { ReleaseTree, ReleaseGrid } from '@/components/releases/ReleaseTree';
import { EmptyState, Skeleton } from '@/components/ui/Card';
import { useReleases } from '@/hooks/useReleases';
import {
  applyReleaseFilters,
  computeReleaseSummary,
  uniqueValues,
} from '@/lib/release-utils';
import {
  defaultReleaseFilters,
  DEFAULT_RELEASE_NAME,
  type ReleaseFilters,
  type ReleaseViewMode,
} from '@/types/releases';

interface ReleasesViewProps {
  autoRefresh: boolean;
  autoRefreshMs: number;
  refreshToken?: number;
  onSyncedAt?: (syncedAt: string | null) => void;
  onLoadingChange?: (loading: boolean) => void;
}

export function ReleasesView({
  autoRefresh,
  autoRefreshMs,
  refreshToken = 0,
  onSyncedAt,
  onLoadingChange,
}: ReleasesViewProps) {
  const [filters, setFilters] = useState<ReleaseFilters>(defaultReleaseFilters);
  const [viewMode, setViewMode] = useState<ReleaseViewMode>('tree');
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  const selectedRelease = filters.release || DEFAULT_RELEASE_NAME;
  const { versions, stories, loading, error, syncedAt, refresh } = useReleases(
    selectedRelease,
    autoRefresh ? autoRefreshMs : 0,
  );

  useEffect(() => {
    if (refreshToken > 0) refresh();
  }, [refreshToken, refresh]);

  useEffect(() => {
    onSyncedAt?.(syncedAt);
  }, [syncedAt, onSyncedAt]);

  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

  // Ensure selected release exists in versions list
  useEffect(() => {
    if (!versions.length) return;
    if (!versions.some((v) => v.name === filters.release)) {
      setFilters((f) => ({ ...f, release: versions[0].name }));
    }
  }, [versions, filters.release]);

  const filtered = useMemo(() => applyReleaseFilters(stories, filters), [stories, filters]);
  const summary = useMemo(() => computeReleaseSummary(filtered), [filtered]);

  const statuses = useMemo(() => uniqueValues(stories, 'status'), [stories]);
  const assignees = useMemo(() => uniqueValues(stories, 'assignee'), [stories]);
  const sprints = useMemo(() => uniqueValues(stories, 'sprint'), [stories]);

  const toggleStory = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const expandAll = () => setExpandedKeys(new Set(filtered.map((s) => s.key)));
  const collapseAll = () => setExpandedKeys(new Set());

  // Expand all when release data finishes loading
  useEffect(() => {
    if (loading) return;
    setExpandedKeys(new Set(stories.map((s) => s.key)));
    // intentionally keyed by selectedRelease + loading so refresh can re-expand
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, selectedRelease]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">📦 Releases</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          BIIH Stories with CAT ID in the summary, plus linked Subtasks. Search by CAT-ID (e.g. 1511).
        </p>
      </div>

      {error && <EmptyState title="Could not load release data" description={error} />}

      <ReleaseToolbar
        filters={filters}
        versions={versions}
        statuses={statuses}
        assignees={assignees}
        sprints={sprints}
        viewMode={viewMode}
        filteredStories={filtered}
        onFiltersChange={setFilters}
        onViewModeChange={setViewMode}
        onExpandAll={expandAll}
        onCollapseAll={collapseAll}
        loading={loading}
      />

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={`row-${i}`} className="h-36" />
          ))}
        </div>
      ) : (
        <>
          <ReleaseSummary summary={summary} />

          {!error && filtered.length === 0 ? (
            <EmptyState
              title="No CAT-ID Stories found"
              description={`No Story issues containing "CAT ID" in the summary were found for "${selectedRelease}". Pick another release or check fixVersion / summary format in Jira.`}
            />
          ) : viewMode === 'tree' ? (
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                {selectedRelease} → Story → Subtasks
              </p>
              <ReleaseTree stories={filtered} expandedKeys={expandedKeys} onToggle={toggleStory} />
            </div>
          ) : (
            <ReleaseGrid stories={filtered} />
          )}
        </>
      )}
    </div>
  );
}
