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

const STATIC_MODE = import.meta.env.VITE_STATIC_MODE === 'true';

const FALLBACK_VERSIONS: ReleaseVersion[] = DEFAULT_RELEASE_OPTIONS.map((name, i) => ({
  id: `default-${i}`,
  name,
  source: 'default',
}));

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
        setVersions(FALLBACK_VERSIONS);
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
          setStories([]);
          setSummary(computeReleaseSummary([]));
          setSyncedAt(new Date().toISOString());
          setError(
            'Releases require live Jira API. Run locally with npm run dev (static GitHub Pages mode has bug data only).',
          );
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
    if (!autoRefreshMs) return;
    const id = setInterval(() => fetchStories(), autoRefreshMs);
    return () => clearInterval(id);
  }, [autoRefreshMs, fetchStories]);

  const refresh = useCallback(async () => {
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
