import { Search, ChevronsUpDown, Minimize2, LayoutGrid, ListTree, Download } from 'lucide-react';
import { Button, Card } from '@/components/ui/Card';
import type { ReleaseFilters, ReleaseViewMode, ReleaseVersion } from '@/types/releases';
import {
  exportReleaseToCsv,
  exportReleaseToExcel,
  exportReleaseToPdf,
} from '@/lib/release-export';
import type { ReleaseStory } from '@/types/releases';

interface ReleaseToolbarProps {
  filters: ReleaseFilters;
  versions: ReleaseVersion[];
  statuses: string[];
  assignees: string[];
  sprints: string[];
  viewMode: ReleaseViewMode;
  filteredStories: ReleaseStory[];
  onFiltersChange: (next: ReleaseFilters) => void;
  onViewModeChange: (mode: ReleaseViewMode) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  loading?: boolean;
}

const selectClass =
  'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200';

export function ReleaseToolbar({
  filters,
  versions,
  statuses,
  assignees,
  sprints,
  viewMode,
  filteredStories,
  onFiltersChange,
  onViewModeChange,
  onExpandAll,
  onCollapseAll,
  loading,
}: ReleaseToolbarProps) {
  const patch = (partial: Partial<ReleaseFilters>) => onFiltersChange({ ...filters, ...partial });

  const releaseName = filters.release;

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-[240px] flex-1 flex-col gap-1 text-xs font-medium text-slate-500">
          Release
          <select
            className={selectClass}
            value={filters.release}
            onChange={(e) => patch({ release: e.target.value })}
            disabled={loading}
          >
            {versions.map((v) => (
              <option key={v.id} value={v.name}>
                {v.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex min-w-[200px] flex-1 flex-col gap-1 text-xs font-medium text-slate-500">
          Search CAT-ID
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className={`${selectClass} w-full pl-9`}
              placeholder="CAT-ID-1501…"
              value={filters.search}
              onChange={(e) => patch({ search: e.target.value })}
            />
          </div>
        </label>

        <label className="flex min-w-[140px] flex-col gap-1 text-xs font-medium text-slate-500">
          Story Status
          <select className={selectClass} value={filters.status} onChange={(e) => patch({ status: e.target.value })}>
            <option value="all">All</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label className="flex min-w-[140px] flex-col gap-1 text-xs font-medium text-slate-500">
          Assignee
          <select
            className={selectClass}
            value={filters.assignee}
            onChange={(e) => patch({ assignee: e.target.value })}
          >
            <option value="all">All</option>
            {assignees.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>

        <label className="flex min-w-[140px] flex-col gap-1 text-xs font-medium text-slate-500">
          Sprint
          <select className={selectClass} value={filters.sprint} onChange={(e) => patch({ sprint: e.target.value })}>
            <option value="all">All</option>
            {sprints.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={viewMode === 'tree' ? 'primary' : 'secondary'}
            onClick={() => onViewModeChange('tree')}
          >
            <ListTree size={16} /> Tree View
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'secondary'}
            onClick={() => onViewModeChange('grid')}
          >
            <LayoutGrid size={16} /> Grid View
          </Button>
          {viewMode === 'tree' && (
            <>
              <Button variant="ghost" onClick={onExpandAll}>
                <ChevronsUpDown size={16} /> Expand All
              </Button>
              <Button variant="ghost" onClick={onCollapseAll}>
                <Minimize2 size={16} /> Collapse All
              </Button>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 inline-flex items-center gap-1 text-xs text-slate-500">
            <Download size={14} /> Export
          </span>
          <Button
            variant="secondary"
            onClick={() => exportReleaseToExcel(filteredStories, releaseName)}
            disabled={!filteredStories.length}
          >
            Excel
          </Button>
          <Button
            variant="secondary"
            onClick={() => exportReleaseToCsv(filteredStories, releaseName)}
            disabled={!filteredStories.length}
          >
            CSV
          </Button>
          <Button
            variant="secondary"
            onClick={() => exportReleaseToPdf(filteredStories, releaseName)}
            disabled={!filteredStories.length}
          >
            PDF
          </Button>
        </div>
      </div>
    </Card>
  );
}
