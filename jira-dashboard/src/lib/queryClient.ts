import { QueryClient } from '@tanstack/react-query';
import { apiUrl, STATIC_MODE } from '@/services/jira/apiBase';
import { clearStaticCache } from '@/services/jira/api';

/** Zero-cache React Query config — always prefer fresh Jira API requests. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      gcTime: 0,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  },
});

export const JIRA_ISSUES_KEY = ['jira', 'issues'] as const;
export const RELEASES_VERSIONS_KEY = ['releases', 'versions'] as const;
export const RELEASES_STORIES_KEY = ['releases', 'stories'] as const;
export const AGENT_STATUS_KEY = ['agent', 'status'] as const;
export const AGENT_INSIGHTS_KEY = ['agent', 'insights'] as const;

export async function refreshAllJiraData() {
  if (STATIC_MODE) {
    clearStaticCache();
  } else {
    await fetch(apiUrl('/api/jira/cache/clear'), { method: 'POST' });
  }
  await queryClient.invalidateQueries();
}
