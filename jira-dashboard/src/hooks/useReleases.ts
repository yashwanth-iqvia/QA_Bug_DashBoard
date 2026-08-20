import { useCallback, useEffect, useState } from 'react';
import type { ReleaseStory, ReleaseSummaryStats, ReleaseVersion } from '@/types/releases';
import { DEFAULT_RELEASE_OPTIONS, DEFAULT_RELEASE_NAME } from '@/types/releases';
import { computeReleaseSummary } from '@/lib/release-utils';

interface VersionsResponse {
  versions?: ReleaseVersion[];
  defaults?: string[];
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

const STATIC_MODE = import.meta.env.VITE_STATIC_MODE === 'true';

const FALLBACK_VERSIONS: ReleaseVersion[] = DEFAULT_RELEASE_OPTIONS.map((name, i) => ({
  id: `default-${i}`,
  name,
  source: 'default',
}));

let staticCache: StaticReleasesPayload | null = null;

async function loadStaticReleases(): Promise<StaticReleasesPayload> {
  if (staticCache) return staticCache;
  const url = `${import.meta.env.BASE_URL}data/jira-releases.json`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(
      'Release data not synced yet. Run Sync Jira Data / Deploy workflow, or export locally with scripts/export_jira_releases_for_pages.py.',
    );
  }
  const data: StaticReleasesPayload = await res.json();
  if (!data.releases || !Object.keys(data.releases).length) {
    throw new Error(
      data.source === 'placeholder'
        ? 'No release data synced yet. Add JIRA secrets and run the Sync/Deploy workflow.'
        : 'Release data file is empty. Re-run the Jira sync workflow.',
    );
  }
  staticCache = data;
  return data;
}

export function useReleases(selectedRelease: string, autoRefreshMs = 0) {
  const [versions, setVersions] = useState<ReleaseVersion[]>(FALLBACK_VERSIONS);
  const [stories, setStories] = useState<ReleaseStory[]>([]);
  const [summary, setSummary] = useState<ReleaseSummaryStats>(computeReleaseSummary([]));
  const [loading, setLoading] = useState(true);
  const [versionsLoading, setVersionsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncedAt, setSyncedAt] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState('');

  const fetchVersions = useCallback(async () => {
    setVersionsLoading(true);
    try {
      if (STATIC_MODE) {
        const data = await loadStaticReleases();
        const list = data.versions?.length ? data.versions : FALLBACK_VERSIONS;
        setVersions(list);
        if (data.baseUrl) setBaseUrl(data.baseUrl);
        if (data.syncedAt) setSyncedAt(data.syncedAt);
        return;
      }
      const res = await fetch('/api/releases/versions');
      const data: VersionsResponse = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load release versions');
      const list = data.versions?.length ? data.versions : FALLBACK_VERSIONS;
      setVersions(list);
      if (data.baseUrl) setBaseUrl(data.baseUrl);
      if (data.syncedAt) setSyncedAt(data.syncedAt);
    } catch {
      if (STATIC_MODE) {
        try {
          const data = await loadStaticReleases();
          setVersions(data.versions?.length ? data.versions : FALLBACK_VERSIONS);
          if (data.baseUrl) setBaseUrl(data.baseUrl);
          if (data.syncedAt) setSyncedAt(data.syncedAt);
          return;
        } catch {
          /* fall through */
        }
      }
      setVersions(FALLBACK_VERSIONS);
    } finally {
      setVersionsLoading(false);
    }
  }, []);

  const fetchStories = useCallback(
    async (opts?: { refresh?: boolean }) => {
      const release = selectedRelease || DEFAULT_RELEASE_NAME;
      setLoading(true);
      setError(null);
      try {
        if (STATIC_MODE) {
          if (opts?.refresh) staticCache = null;
          const data = await loadStaticReleases();
          const bundle = data.releases?.[release];
          const nextStories = bundle?.stories || [];
          setStories(nextStories);
          setSummary(bundle?.summary || computeReleaseSummary(nextStories));
          setSyncedAt(data.syncedAt || new Date().toISOString());
          if (data.baseUrl) setBaseUrl(data.baseUrl);
          if (!bundle) {
            setError(
              `No synced data for "${release}". Available releases: ${Object.keys(data.releases || {}).join(', ') || 'none'}.`,
            );
          } else if (bundle.error) {
            setError(bundle.error);
          }
          return;
        }

        const params = new URLSearchParams({ version: release });
        if (opts?.refresh) params.set('refresh', '1');
        const res = await fetch(`/api/releases/stories?${params}`);
        const data: StoriesResponse = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load release stories');

        const nextStories = data.stories || [];
        setStories(nextStories);
        setSummary(data.summary || computeReleaseSummary(nextStories));
        setSyncedAt(data.syncedAt || new Date().toISOString());
        if (data.baseUrl) setBaseUrl(data.baseUrl);
      } catch (e) {
        // Live API down: try static JSON fallback (same pattern as bugs)
        if (!STATIC_MODE) {
          try {
            staticCache = null;
            const data = await loadStaticReleases();
            const bundle = data.releases?.[release];
            const nextStories = bundle?.stories || [];
            setStories(nextStories);
            setSummary(bundle?.summary || computeReleaseSummary(nextStories));
            setSyncedAt(data.syncedAt || null);
            if (data.baseUrl) setBaseUrl(data.baseUrl);
            setError(null);
            return;
          } catch {
            /* fall through */
          }
        }
        setError(e instanceof Error ? e.message : 'Unknown error');
        setStories([]);
        setSummary(computeReleaseSummary([]));
      } finally {
        setLoading(false);
      }
    },
    [selectedRelease],
  );

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  useEffect(() => {
    if (!autoRefreshMs || STATIC_MODE) return;
    const id = setInterval(() => fetchStories(), autoRefreshMs);
    return () => clearInterval(id);
  }, [autoRefreshMs, fetchStories]);

  const refresh = useCallback(async () => {
    if (STATIC_MODE) staticCache = null;
    await Promise.all([fetchVersions(), fetchStories({ refresh: true })]);
  }, [fetchVersions, fetchStories]);

  return {
    versions,
    stories,
    summary,
    loading: loading || versionsLoading,
    error,
    syncedAt,
    baseUrl,
    refresh,
  };
}
