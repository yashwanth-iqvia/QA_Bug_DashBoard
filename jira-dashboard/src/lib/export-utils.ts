import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { BugRecord } from '@/types/jira';
import { downloadBlob } from '@/lib/utils';

const EXPORT_COLUMNS: (keyof BugRecord)[] = [
  'key',
  'summary',
  'project',
  'reporter',
  'assignee',
  'priority',
  'severity',
  'status',
  'created',
  'updated',
  'resolutionDate',
  'labels',
  'sprint',
  'storyPoints',
  'acceptanceCriteria',
  'description',
  'jiraUrl',
];

const HEADERS: Record<string, string> = {
  key: 'Bug ID',
  summary: 'Summary',
  project: 'Project',
  reporter: 'Reporter',
  assignee: 'Assignee',
  priority: 'Priority',
  severity: 'Severity',
  status: 'Status',
  created: 'Created Date',
  updated: 'Updated Date',
  resolutionDate: 'Resolution Date',
  labels: 'Labels',
  sprint: 'Sprint',
  storyPoints: 'Story Points',
  acceptanceCriteria: 'Acceptance Criteria',
  description: 'Description',
  jiraUrl: 'Jira URL',
};

function toRows(bugs: BugRecord[]) {
  return bugs.map((bug) => {
    const row: Record<string, string> = {};
    EXPORT_COLUMNS.forEach((col) => {
      row[HEADERS[col]] = String(bug[col] ?? '');
    });
    return row;
  });
}

export function exportToExcel(bugs: BugRecord[], filename = 'jira-bugs.xlsx') {
  const ws = XLSX.utils.json_to_sheet(toRows(bugs));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Bugs');
  XLSX.writeFile(wb, filename);
}

export function exportToCsv(bugs: BugRecord[], filename = 'jira-bugs.csv') {
  const rows = toRows(bugs);
  const headers = Object.keys(rows[0] || {});
  const csv = [
    headers.join(','),
    ...rows.map((row) => headers.map((h) => `"${String(row[h]).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');
  downloadBlob(csv, filename, 'text/csv;charset=utf-8;');
}

export function exportToPdf(bugs: BugRecord[], filename = 'jira-bugs.pdf') {
  const doc = new jsPDF({ orientation: 'landscape' });
  autoTable(doc, {
    head: [['Bug ID', 'Summary', 'Status', 'Priority', 'Reporter', 'Assignee']],
    body: bugs.map((b) => [b.key, b.summary, b.status, b.priority, b.reporter, b.assignee]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [31, 78, 120] },
  });
  doc.save(filename);
}
