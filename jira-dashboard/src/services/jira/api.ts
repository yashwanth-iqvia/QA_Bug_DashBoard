import type { JiraIssue } from '@/types/jira';
import type { ReleaseStory, ReleaseSummaryStats, ReleaseVersion } from '@/types/releases';
import { apiUrl, hasRemoteApi, isGitHubPagesHost } from '@/services/jira/apiBase';

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

function apiUnavailableMessage(): string {
  if (isGitHubPagesHost() && !hasRemoteApi()) {
    return (
      'GitHub Pages cannot call Jira directly. Deploy the API (see GITHUB_PAGES_SETUP.md), ' +
      'set the VITE_API_URL GitHub secret, and redeploy Pages.'
    );
  }
  return 'API server unavailable. Run `npm run dev` in jira-dashboard and open http://localhost:5175.';
}

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    if (text.trimStart().startsWith('<!DOCTYPE') || text.trimStart().startsWith('<html')) {
      throw new Error(apiUnavailableMessage());
    }
    throw new Error(text.slice(0, 200) || `Unexpected response (${res.status})`);
  }
  const data = JSON.parse(text) as T & { error?: string };
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export async function fetchJiraIssues(issueType: 'all' | 'Bug' = 'Bug', refresh = false): Promise<IssuesResponse> {
  const params = new URLSearchParams({ type: issueType });
  if (refresh) params.set('refresh', '1');
  const res = await fetch(apiUrl(`/api/jira/issues?${params}`));
  return parseJson(res);
}

export async function fetchReleaseVersions(refresh = false): Promise<VersionsResponse> {
  const params = refresh ? '?refresh=1' : '';
  const res = await fetch(apiUrl(`/api/releases/versions${params}`));
  return parseJson(res);
}

export async function fetchReleaseStories(version: string, refresh = false): Promise<StoriesResponse> {
  const params = new URLSearchParams({ version });
  if (refresh) params.set('refresh', '1');
  const res = await fetch(apiUrl(`/api/releases/stories?${params}`));
  return parseJson(res);
}

export async function fetchAgentStatus() {
  const res = await fetch(apiUrl('/api/agent/status'));
  return parseJson(res);
}

export async function fetchAgentInsights() {
  const res = await fetch(apiUrl('/api/agent/insights'));
  return parseJson(res);
}

export async function reindexAgent() {
  const res = await fetch(apiUrl('/api/agent/reindex'), { method: 'POST' });
  return parseJson(res);
}

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(apiUrl(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return parseJson(res);
}

export async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(apiUrl(path));
  return parseJson(res);
}
