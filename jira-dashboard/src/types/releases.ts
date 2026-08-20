export interface ReleaseVersion {
  id: string;
  name: string;
  released?: boolean;
  archived?: boolean;
  releaseDate?: string | null;
  source?: 'default' | 'jira';
}

export interface ReleaseSubtask {
  key: string;
  catId?: string | null;
  catIdLabel?: string | null;
  summary: string;
  status: string;
  assignee: string;
  priority?: string;
  jiraUrl: string;
}

export interface ReleaseStory {
  key: string;
  catId?: string | null;
  catIdLabel: string;
  summary: string;
  status: string;
  assignee: string;
  priority: string;
  sprint: string;
  release: string;
  storyPoints: string;
  jiraUrl: string;
  subtasks: ReleaseSubtask[];
}

export interface ReleaseSummaryStats {
  totalStories: number;
  totalSubtasks: number;
  completedStories: number;
  inProgressStories: number;
  pendingStories: number;
}

export interface ReleaseFilters {
  search: string;
  release: string;
  status: string;
  assignee: string;
  sprint: string;
}

export type ReleaseViewMode = 'tree' | 'grid';

export const DEFAULT_RELEASE_NAME = 'Release 1 - Promo (GenMed, ONC and BISO)';

export const DEFAULT_RELEASE_OPTIONS = [
  'Release 1 - Promo (GenMed, ONC and BISO)',
  'Release 2',
  'Release 3',
  'Future Releases',
];

export const defaultReleaseFilters: ReleaseFilters = {
  search: '',
  release: DEFAULT_RELEASE_NAME,
  status: 'all',
  assignee: 'all',
  sprint: 'all',
};

/** Map story/subtask status to visual badge color key */
export function storyStatusColor(status: string): string {
  const s = (status || '').toLowerCase();
  if (s.includes('block')) return 'blocked';
  if (s.includes('test') || s.includes('ready for test') || s.includes('uat')) return 'testing';
  if (s.includes('progress') || s.includes('review')) return 'progress';
  if (['done', 'resolved', 'closed', 'completed'].includes(s)) return 'done';
  return 'todo';
}

export function isCompletedStatus(status: string) {
  const s = (status || '').toLowerCase();
  return ['done', 'resolved', 'closed', 'completed'].includes(s);
}

export function isInProgressStatus(status: string) {
  const s = (status || '').toLowerCase();
  return (
    s.includes('progress') ||
    s.includes('testing') ||
    s.includes('review') ||
    s.includes('uat') ||
    s === 'ready for test'
  );
}
