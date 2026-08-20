export interface JiraUser {
  displayName?: string;
  name?: string;
  emailAddress?: string;
}

export interface JiraIssue {
  id: string;
  key: string;
  fields: {
    summary?: string;
    description?: string | null;
    issuetype?: { name: string };
    status?: { name: string };
    priority?: { name: string };
    reporter?: JiraUser | null;
    assignee?: JiraUser | null;
    created?: string;
    updated?: string;
    resolutiondate?: string | null;
    labels?: string[];
    components?: { name: string }[];
    fixVersions?: { name: string }[];
    project?: { key: string; name: string };
    customfield_15048?: string | null;
    customfield_10020?: { name: string }[] | null;
    customfield_10016?: number | null;
    customfield_10002?: number | null;
  };
  renderedFields?: { description?: string };
}

export interface BugRecord {
  id: string;
  key: string;
  summary: string;
  description: string;
  acceptanceCriteria: string;
  project: string;
  reporter: string;
  assignee: string;
  priority: string;
  severity: string;
  status: string;
  created: string;
  updated: string;
  resolutionDate: string;
  labels: string;
  sprint: string;
  storyPoints: string;
  issueType: string;
  jiraUrl: string;
}

export interface DashboardFilters {
  search: string;
  issueType: 'all' | 'Bug';
  project: string;
  assignee: string;
  reporter: string;
  qaTeam: 'all' | 'qa' | 'others';
  priority: string;
  severity: string;
  status: string;
  labels: string;
  dateFrom: string;
  dateTo: string;
  quickStatus: string;
}

export interface ReporterStats {
  reporter: string;
  total: number;
  open: number;
  resolved: number;
  critical: number;
  avgResolutionDays: number;
}

export const OPEN_STATUSES = ['Open', 'To Do', 'In Progress', 'Ready For Test', 'Testing', 'In Testing', 'Blocked', 'PO REVIEW'];
export const RESOLVED_STATUSES = ['Done', 'Resolved', 'Closed'];
export const CRITICAL_PRIORITIES = ['Critical', 'Highest', 'Blocker'];

export const STATUS_GROUPS = [
  'Open',
  'To Do',
  'In Progress',
  'Ready For Test',
  'Testing',
  'Blocked',
  'Resolved',
  'Closed',
];

export const PRIORITY_COLORS: Record<string, string> = {
  Critical: '#DC2626',
  Highest: '#DC2626',
  Blocker: '#DC2626',
  High: '#EA580C',
  Medium: '#CA8A04',
  Low: '#16A34A',
  Lowest: '#16A34A',
};

export const defaultFilters: DashboardFilters = {
  search: '',
  issueType: 'Bug',
  project: 'all',
  assignee: 'all',
  reporter: 'all',
  qaTeam: 'all',
  priority: 'all',
  severity: 'all',
  status: 'all',
  labels: 'all',
  dateFrom: '',
  dateTo: '',
  quickStatus: 'all',
};
