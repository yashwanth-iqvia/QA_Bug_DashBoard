import type { JiraIssue } from '@/types/jira';
import type { ReleaseStory, ReleaseSummaryStats, ReleaseVersion } from '@/types/releases';

interface IssuesResponse {
  total: number;
  baseUrl: string;
  issues: JiraIssue[];
  syncedAt: string;
  error?: string;
}

interface VersionsResponse {
  versions?: ReleaseVersion[];
  baseUrl?: string;
  syncedAt?: string;
  error?: string;
}

interface StoriesResponse {
  version?: string;
  baseUrl?: string;
  syncedAt?: string;
  summary?: ReleaseSummaryStats;
  stories?: ReleaseStory[];
  error?: string;
}

async function parseJson<T>(res: Response): Promise<T> {
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export async function fetchJiraIssues(issueType: 'all' | 'Bug' = 'Bug', refresh = false): Promise<IssuesResponse> {
  const params = new URLSearchParams({ type: issueType });
  if (refresh) params.set('refresh', '1');
  const res = await fetch(`/api/jira/issues?${params}`);
  return parseJson(res);
}

export async function fetchReleaseVersions(refresh = false): Promise<VersionsResponse> {
  const params = refresh ? '?refresh=1' : '';
  const res = await fetch(`/api/releases/versions${params}`);
  return parseJson(res);
}

export async function fetchReleaseStories(version: string, refresh = false): Promise<StoriesResponse> {
  const params = new URLSearchParams({ version });
  if (refresh) params.set('refresh', '1');
  const res = await fetch(`/api/releases/stories?${params}`);
  return parseJson(res);
}

export async function fetchAgentStatus() {
  const res = await fetch('/api/agent/status');
  return parseJson(res);
}

export async function fetchAgentInsights() {
  const res = await fetch('/api/agent/insights');
  return parseJson(res);
}

export async function reindexAgent() {
  const res = await fetch('/api/agent/reindex', { method: 'POST' });
  return parseJson(res);
}
