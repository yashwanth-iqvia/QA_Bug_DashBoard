import { Card, CardTitle, Button } from '@/components/ui/Card';
import type { BugRecord, DashboardFilters } from '@/types/jira';
import { getLabelOptions, uniqueFieldValues, uniqueReporters } from '@/lib/filter-utils';
import { defaultFilters } from '@/types/jira';

interface AdvancedFiltersProps {
  filters: DashboardFilters;
  bugs: BugRecord[];
  onChange: (filters: DashboardFilters) => void;
  onSaveView: () => void;
  onLoadView: () => void;
}

export function AdvancedFilters({ filters, bugs, onChange, onSaveView, onLoadView }: AdvancedFiltersProps) {
  const set = (patch: Partial<DashboardFilters>) => onChange({ ...filters, ...patch });

  const selectClass =
    'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100';

  const labelOptions = getLabelOptions(bugs);

  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <CardTitle className="mb-0">Advanced Filters</CardTitle>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onSaveView}>Save View</Button>
          <Button variant="secondary" onClick={onLoadView}>Load View</Button>
          <Button variant="ghost" onClick={() => onChange({ ...defaultFilters })}>Clear</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <input
          className={selectClass}
          placeholder="Global search..."
          value={filters.search}
          onChange={(e) => set({ search: e.target.value })}
        />
        <select className={selectClass} value={filters.issueType} onChange={(e) => set({ issueType: e.target.value as 'all' | 'Bug' })}>
          <option value="Bug">Bugs Only</option>
          <option value="all">All Tickets</option>
        </select>
        <select className={selectClass} value={filters.project} onChange={(e) => set({ project: e.target.value })}>
          <option value="all">All Projects</option>
          {uniqueFieldValues(bugs, 'project').map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
        <select className={selectClass} value={filters.qaTeam} onChange={(e) => set({ qaTeam: e.target.value as DashboardFilters['qaTeam'] })}>
          <option value="all">All Teams</option>
          <option value="qa">QA Team (Adhesh, Darwin, Yashwanth)</option>
          <option value="others">Other Teams</option>
        </select>
        <select className={selectClass} value={filters.assignee} onChange={(e) => set({ assignee: e.target.value })}>
          <option value="all">All Assignees</option>
          {uniqueFieldValues(bugs, 'assignee').map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
        <select className={selectClass} value={filters.reporter} onChange={(e) => set({ reporter: e.target.value })}>
          <option value="all">All Reporters</option>
          {uniqueReporters(bugs).map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
        <select className={selectClass} value={filters.priority} onChange={(e) => set({ priority: e.target.value })}>
          <option value="all">All Priorities</option>
          {uniqueFieldValues(bugs, 'priority').map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
        <select className={selectClass} value={filters.status} onChange={(e) => set({ status: e.target.value })}>
          <option value="all">All Statuses</option>
          {uniqueFieldValues(bugs, 'status').map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
        <select className={selectClass} value={filters.labels} onChange={(e) => set({ labels: e.target.value })}>
          <option value="all">All Labels</option>
          {labelOptions.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
        <input type="date" className={selectClass} value={filters.dateFrom} onChange={(e) => set({ dateFrom: e.target.value })} />
        <input type="date" className={selectClass} value={filters.dateTo} onChange={(e) => set({ dateTo: e.target.value })} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {[
          { id: 'all', label: 'All' },
          { id: 'open', label: 'Open' },
          { id: 'resolved', label: 'Resolved' },
          { id: 'critical', label: 'Critical' },
          { id: 'high', label: 'High Priority' },
        ].map((q) => (
          <button
            key={q.id}
            type="button"
            onClick={() => set({ quickStatus: q.id })}
            className={`rounded-full px-3 py-1 text-xs font-medium ${filters.quickStatus === q.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}
          >
            {q.label}
          </button>
        ))}
        <span className="mx-1 self-center text-slate-300">|</span>
        {['UI', 'Export', 'Data'].map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => set({ labels: label })}
            className={`rounded-full px-3 py-1 text-xs font-medium ${filters.labels === label ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => set({ qaTeam: 'qa' })}
          className={`rounded-full px-3 py-1 text-xs font-medium ${filters.qaTeam === 'qa' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}
        >
          QA Team
        </button>
      </div>
    </Card>
  );
}
