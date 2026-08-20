import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Card, CardTitle, Badge } from '@/components/ui/Card';
import type { BugRecord } from '@/types/jira';
import { formatDate } from '@/lib/utils';

interface BugTableProps {
  bugs: BugRecord[];
}

function priorityColor(priority: string) {
  const p = priority.toLowerCase();
  if (p.includes('critical') || p.includes('highest') || p.includes('blocker')) return 'critical';
  if (p.includes('high')) return 'high';
  if (p.includes('medium')) return 'medium';
  if (p.includes('low')) return 'low';
  return 'slate';
}

export function BugTable({ bugs }: BugTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const columns = useMemo<ColumnDef<BugRecord>[]>(
    () => [
      {
        accessorKey: 'key',
        header: 'Bug ID',
        cell: ({ row }) => (
          <a href={row.original.jiraUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-blue-600 hover:underline">
            {row.original.key} <ExternalLink size={12} />
          </a>
        ),
      },
      { accessorKey: 'summary', header: 'Summary', cell: ({ getValue }) => <span className="line-clamp-2 max-w-xs">{String(getValue())}</span> },
      { accessorKey: 'project', header: 'Project' },
      { accessorKey: 'reporter', header: 'Reporter' },
      { accessorKey: 'assignee', header: 'Assignee' },
      {
        accessorKey: 'priority',
        header: 'Priority',
        cell: ({ getValue }) => <Badge color={priorityColor(String(getValue()))}>{String(getValue())}</Badge>,
      },
      { accessorKey: 'severity', header: 'Severity' },
      { accessorKey: 'status', header: 'Status' },
      { accessorKey: 'created', header: 'Created', cell: ({ getValue }) => formatDate(String(getValue())) },
      { accessorKey: 'updated', header: 'Updated', cell: ({ getValue }) => formatDate(String(getValue())) },
      { accessorKey: 'resolutionDate', header: 'Resolution', cell: ({ getValue }) => formatDate(String(getValue())) },
      { accessorKey: 'labels', header: 'Labels' },
      { accessorKey: 'sprint', header: 'Sprint' },
      { accessorKey: 'storyPoints', header: 'Story Points' },
    ],
    [],
  );

  const table = useReactTable({
    data: bugs,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <CardTitle className="mb-0">Bug List ({bugs.length})</CardTitle>
        <input
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
          placeholder="Search table..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-slate-200 bg-slate-50 text-left dark:border-slate-700 dark:bg-slate-800/50">
                {hg.headers.map((header) => (
                  <th key={header.id} className="cursor-pointer px-3 py-2 font-semibold text-slate-600 dark:text-slate-300" onClick={header.column.getToggleSortingHandler()}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{ asc: ' ↑', desc: ' ↓' }[header.column.getIsSorted() as string] ?? ''}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-2 align-top text-slate-700 dark:text-slate-200">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </p>
        <div className="flex gap-2">
          <button type="button" className="rounded-lg border px-3 py-1 text-sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</button>
          <button type="button" className="rounded-lg border px-3 py-1 text-sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</button>
        </div>
      </div>
    </Card>
  );
}
