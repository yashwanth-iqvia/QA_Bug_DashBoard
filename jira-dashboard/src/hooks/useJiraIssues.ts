import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { fetchJiraIssues } from '@/services/jira/api';
import { normalizeIssue } from '@/lib/jira-utils';
import { JIRA_ISSUES_KEY } from '@/lib/queryClient';
import type { BugRecord } from '@/types/jira';

const TEN_MINUTES = 10 * 60 * 1000;

export function useJiraIssues(issueType: 'all' | 'Bug' = 'Bug', autoRefreshMs = TEN_MINUTES) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [...JIRA_ISSUES_KEY, issueType],
    queryFn: () => fetchJiraIssues(issueType),
    refetchInterval: autoRefreshMs > 0 ? autoRefreshMs : false,
  });

  const normalized = (query.data?.issues ?? []).map((i) =>
    normalizeIssue(i, query.data?.baseUrl ?? ''),
  );
  const allIssues: BugRecord[] = normalized;
  const bugs = normalized.filter((b) => issueType === 'all' || b.issueType === 'Bug');

  const refresh = useCallback(async () => {
    await fetchJiraIssues(issueType, true);
    await queryClient.invalidateQueries({ queryKey: JIRA_ISSUES_KEY });
  }, [issueType, queryClient]);

  return {
    bugs,
    allIssues,
    loading: query.isLoading || query.isFetching,
    error: query.error instanceof Error ? query.error.message : query.error ? String(query.error) : null,
    syncedAt: query.data?.syncedAt ?? null,
    baseUrl: query.data?.baseUrl ?? '',
    refresh,
  };
}
