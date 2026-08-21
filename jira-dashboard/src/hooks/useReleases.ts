import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { fetchReleaseStories, fetchReleaseVersions } from '@/services/jira/api';
import { computeReleaseSummary } from '@/lib/release-utils';
import { RELEASES_STORIES_KEY, RELEASES_VERSIONS_KEY } from '@/lib/queryClient';
import { DEFAULT_RELEASE_NAME } from '@/types/releases';

const TEN_MINUTES = 10 * 60 * 1000;

export function useReleases(selectedRelease: string, autoRefreshMs = TEN_MINUTES) {
  const queryClient = useQueryClient();
  const release = selectedRelease || DEFAULT_RELEASE_NAME;

  const versionsQuery = useQuery({
    queryKey: RELEASES_VERSIONS_KEY,
    queryFn: () => fetchReleaseVersions(),
  });

  const storiesQuery = useQuery({
    queryKey: [...RELEASES_STORIES_KEY, release],
    queryFn: () => fetchReleaseStories(release),
    refetchInterval: autoRefreshMs > 0 ? autoRefreshMs : false,
  });

  const versions = versionsQuery.data?.versions?.length ? versionsQuery.data.versions : [];
  const stories = storiesQuery.data?.stories ?? [];
  const summary = useMemo(
    () => storiesQuery.data?.summary ?? computeReleaseSummary(stories),
    [storiesQuery.data?.summary, stories],
  );

  const loading = versionsQuery.isLoading || storiesQuery.isLoading;

  const error =
    (storiesQuery.error instanceof Error ? storiesQuery.error.message : null) ||
    (versionsQuery.error instanceof Error ? versionsQuery.error.message : null);

  const syncedAt = storiesQuery.data?.syncedAt ?? versionsQuery.data?.syncedAt ?? null;
  const baseUrl = storiesQuery.data?.baseUrl ?? versionsQuery.data?.baseUrl ?? '';

  const refresh = useCallback(async () => {
    await Promise.all([fetchReleaseVersions(true), fetchReleaseStories(release, true)]);
    await queryClient.invalidateQueries({ queryKey: RELEASES_VERSIONS_KEY });
    await queryClient.invalidateQueries({ queryKey: RELEASES_STORIES_KEY });
  }, [queryClient, release]);

  return {
    versions,
    stories,
    summary,
    loading,
    error,
    syncedAt,
    baseUrl,
    refresh,
  };
}
