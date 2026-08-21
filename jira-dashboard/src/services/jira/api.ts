import type { JiraIssue } from '@/types/jira';
import type { ReleaseStory, ReleaseSummaryStats, ReleaseVersion } from '@/types/releases';
import { apiUrl, STATIC_MODE, staticDataUrl } from '@/services/jira/apiBase';
import { computeReleaseSummary } from '@/lib/release-utils';

interface IssuesResponse {
  total: number;
  baseUrl: string;
  issues: JiraIssue[];
  syncedAt: string;
  error?: string;
  source?: string;
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

interface StaticReleasesPayload {
  baseUrl?: string;
  syncedAt?: string;
  versions?: ReleaseVersion[];
  releases?: Record<
    string,
    {
      version?: string;
      summary?: ReleaseSummaryStats;
      stories?: ReleaseStory[];
      error?: string;
    }
  >;
  source?: string;
  error?: string;
}

let staticReleasesCache: StaticReleasesPayload | null = null;

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    if (text.trimStart().startsWith('<!DOCTYPE') || text.trimStart().startsWith('<html')) {
      throw new Error(
        STATIC_MODE
          ? 'Jira data not synced yet. Run Sync Jira Data workflow on GitHub Actions.'
          : 'API server unavailable. Run `npm run dev` in jira-dashboard and open http://localhost:5175.',
      );
    }
    throw new Error(text.slice(0, 200) || `Unexpected response (${res.status})`);
  }
  const data = JSON.parse(text) as T & { error?: string };
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

/** Always cache-bust on GitHub Pages so CDN/browser never serves stale Jira JSON. */
async function fetchStaticJson<T>(path: string): Promise<T> {
  const url = `${staticDataUrl(path)}?t=${Date.now()}`;
  const res = await fetch(url, { cache: 'no-store' });
  return parseJson<T>(res);
}

async function loadStaticReleases(refresh = false): Promise<StaticReleasesPayload> {
  if (!refresh && staticReleasesCache) return staticReleasesCache;
  const data = await fetchStaticJson<StaticReleasesPayload>('data/jira-releases.json');
  if (!data.releases || !Object.keys(data.releases).length) {
    throw new Error(
      data.source === 'placeholder'
        ? 'No release data synced yet. Add JIRA secrets and run Sync Jira Data workflow.'
        : 'Release data file is empty. Re-run the Jira sync workflow.',
    );
  }
  staticReleasesCache = data;
  return data;
}

async function fetchStaticIssues(issueType: 'all' | 'Bug'): Promise<IssuesResponse> {
  const data = await fetchStaticJson<IssuesResponse>('data/jira-bugs.json');
  if (!data.issues?.length) {
    throw new Error(
      data.source === 'placeholder'
        ? 'No Jira data synced yet. Add JIRA secrets and run Sync Jira Data workflow.'
        : 'Jira data file is empty. Run Sync Jira Data workflow on GitHub.',
    );
  }
  const issues =
    issueType === 'Bug'
      ? data.issues.filter((i) => i.fields?.issuetype?.name === 'Bug')
      : data.issues;
  return { ...data, total: issues.length, issues };
}

export async function fetchJiraIssues(issueType: 'all' | 'Bug' = 'Bug', _refresh = false): Promise<IssuesResponse> {
  if (STATIC_MODE) {
    return fetchStaticIssues(issueType);
  }

  const params = new URLSearchParams({ type: issueType });
  if (_refresh) params.set('refresh', '1');
  const res = await fetch(apiUrl(`/api/jira/issues?${params}`));
  return parseJson(res);
}

export async function fetchReleaseVersions(refresh = false): Promise<VersionsResponse> {
  if (STATIC_MODE) {
    const data = await loadStaticReleases(refresh);
    return {
      versions: data.versions,
      baseUrl: data.baseUrl,
      syncedAt: data.syncedAt,
    };
  }
  const params = refresh ? '?refresh=1' : '';
  const res = await fetch(apiUrl(`/api/releases/versions${params}`));
  return parseJson(res);
}

export async function fetchReleaseStories(version: string, refresh = false): Promise<StoriesResponse> {
  if (STATIC_MODE) {
    const data = await loadStaticReleases(refresh);
    const bundle = data.releases?.[version];
    const stories = bundle?.stories || [];
    return {
      version,
      baseUrl: data.baseUrl,
      syncedAt: data.syncedAt,
      summary: bundle?.summary || computeReleaseSummary(stories),
      stories,
      error: bundle?.error,
    };
  }
  const params = new URLSearchParams({ version });
  if (refresh) params.set('refresh', '1');
  const res = await fetch(apiUrl(`/api/releases/stories?${params}`));
  return parseJson(res);
}

export async function fetchAgentStatus() {
  if (STATIC_MODE) throw new Error('static-mode');
  const res = await fetch(apiUrl('/api/agent/status'));
  return parseJson(res);
}

export async function fetchAgentInsights() {
  if (STATIC_MODE) throw new Error('static-mode');
  const res = await fetch(apiUrl('/api/agent/insights'));
  return parseJson(res);
}

export async function reindexAgent() {
  if (STATIC_MODE) return { ok: true };
  const res = await fetch(apiUrl('/api/agent/reindex'), { method: 'POST' });
  return parseJson(res);
}

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  if (STATIC_MODE) throw new Error('static-mode');
  const res = await fetch(apiUrl(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return parseJson(res);
}

export async function getJson<T>(path: string): Promise<T> {
  if (STATIC_MODE) throw new Error('static-mode');
  const res = await fetch(apiUrl(path));
  return parseJson(res);
}

export function clearStaticCache() {
  staticReleasesCache = null;
}
