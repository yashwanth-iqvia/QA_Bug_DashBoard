import { Card, CardTitle, Button } from '@/components/ui/Card';
import type { BugRecord } from '@/types/jira';
import { exportToCsv, exportToExcel, exportToPdf } from '@/lib/export-utils';

interface ExportCenterProps {
  bugs: BugRecord[];
  filtered: BugRecord[];
  onClose?: () => void;
}

export function ExportCenter({ bugs, filtered, onClose }: ExportCenterProps) {
  const exportGroups = [
    { label: 'All Bugs', data: bugs },
    { label: 'Filtered Bugs', data: filtered },
    {
      label: 'Reporter-wise Bugs',
      data: bugs,
      note: 'Use Excel/CSV for full reporter breakdown',
    },
    {
      label: 'Status-wise Bugs',
      data: bugs,
      note: 'Use Excel/CSV for full status breakdown',
    },
  ];

  return (
    <Card className="border-blue-200 dark:border-blue-900">
      <div className="mb-4 flex items-center justify-between">
        <CardTitle className="mb-0">Export Center</CardTitle>
        {onClose && <Button variant="ghost" onClick={onClose}>Close</Button>}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {exportGroups.map((group) => (
          <div key={group.label} className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
            <h4 className="font-semibold text-slate-800 dark:text-slate-100">{group.label}</h4>
            <p className="mt-1 text-xs text-slate-500">{group.data.length} records</p>
            {group.note && <p className="mt-1 text-xs text-slate-400">{group.note}</p>}
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => exportToExcel(group.data, `${group.label.replace(/\s+/g, '-').toLowerCase()}.xlsx`)}>Excel</Button>
              <Button variant="secondary" onClick={() => exportToCsv(group.data, `${group.label.replace(/\s+/g, '-').toLowerCase()}.csv`)}>CSV</Button>
              <Button variant="secondary" onClick={() => exportToPdf(group.data, `${group.label.replace(/\s+/g, '-').toLowerCase()}.pdf`)}>PDF</Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
