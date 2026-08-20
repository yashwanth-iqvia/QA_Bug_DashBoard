import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ReleaseStory } from '@/types/releases';
import { downloadBlob } from '@/lib/utils';
import { completedSubtaskCount } from '@/lib/release-utils';

function flattenRows(stories: ReleaseStory[], releaseName: string) {
  const rows: Record<string, string>[] = [];

  stories.forEach((story) => {
    rows.push({
      Type: 'Story',
      'CAT-ID': story.catIdLabel || '',
      Key: story.key,
      Summary: story.summary,
      Status: story.status,
      Assignee: story.assignee,
      Priority: story.priority,
      Sprint: story.sprint,
      Release: story.release || releaseName,
      'Story Points': story.storyPoints,
      'Parent Key': '',
      'Total Subtasks': String(story.subtasks.length),
      'Completed Subtasks': String(completedSubtaskCount(story)),
      'Jira URL': story.jiraUrl,
    });

    story.subtasks.forEach((st) => {
      rows.push({
        Type: 'Subtask',
        'CAT-ID': st.catIdLabel || story.catIdLabel || '',
        Key: st.key,
        Summary: st.summary,
        Status: st.status,
        Assignee: st.assignee,
        Priority: st.priority || '',
        Sprint: story.sprint,
        Release: story.release || releaseName,
        'Story Points': '',
        'Parent Key': story.key,
        'Total Subtasks': '',
        'Completed Subtasks': '',
        'Jira URL': st.jiraUrl,
      });
    });
  });

  return rows;
}

export function exportReleaseToExcel(stories: ReleaseStory[], releaseName: string, filename?: string) {
  const rows = flattenRows(stories, releaseName);
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Release');
  XLSX.writeFile(wb, filename || `release-${safeName(releaseName)}.xlsx`);
}

export function exportReleaseToCsv(stories: ReleaseStory[], releaseName: string, filename?: string) {
  const rows = flattenRows(stories, releaseName);
  const headers = Object.keys(rows[0] || {
    Type: '',
    Key: '',
    Summary: '',
    Status: '',
    Assignee: '',
  });
  const csv = [
    headers.join(','),
    ...rows.map((row) => headers.map((h) => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(',')),
  ].join('\n');
  downloadBlob(csv, filename || `release-${safeName(releaseName)}.csv`, 'text/csv;charset=utf-8;');
}

export function exportReleaseToPdf(stories: ReleaseStory[], releaseName: string, filename?: string) {
  const doc = new jsPDF({ orientation: 'landscape' });
  doc.setFontSize(14);
  doc.text(`Release: ${releaseName}`, 14, 16);
  autoTable(doc, {
    startY: 22,
    head: [['Type', 'CAT-ID', 'Key', 'Summary', 'Status', 'Assignee']],
    body: flattenRows(stories, releaseName).map((r) => [
      r.Type,
      r['CAT-ID'],
      r.Key,
      r.Summary,
      r.Status,
      r.Assignee,
    ]),
    styles: { fontSize: 7 },
    headStyles: { fillColor: [31, 78, 120] },
    columnStyles: {
      3: { cellWidth: 70 },
    },
  });
  doc.save(filename || `release-${safeName(releaseName)}.pdf`);
}

function safeName(name: string) {
  return name.replace(/[^\w.-]+/g, '-').slice(0, 60);
}
