import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import type {
  AgentInsights,
  AgentStatus,
  BugSummary,
  ChatMessage,
  CreationAssistResult,
  DefectBatchResult,
  DuplicateRecommendation,
  SimilarBugMatch,
} from '@/types/agent';
import {
  fetchAgentInsights,
  fetchAgentStatus,
  getJson,
  postJson,
  reindexAgent,
} from '@/services/jira/api';
import { AGENT_INSIGHTS_KEY, AGENT_STATUS_KEY } from '@/lib/queryClient';

const TEN_MINUTES = 10 * 60 * 1000;

export function useBugAgent(autoRefreshMs = TEN_MINUTES) {
  const queryClient = useQueryClient();

  const statusQuery = useQuery({
    queryKey: AGENT_STATUS_KEY,
    queryFn: fetchAgentStatus,
    refetchInterval: autoRefreshMs > 0 ? autoRefreshMs : false,
  });

  const insightsQuery = useQuery({
    queryKey: AGENT_INSIGHTS_KEY,
    queryFn: fetchAgentInsights,
    refetchInterval: autoRefreshMs > 0 ? autoRefreshMs : false,
  });

  const loading =
    statusQuery.isLoading ||
    statusQuery.isFetching ||
    insightsQuery.isLoading ||
    insightsQuery.isFetching;

  const error =
    (statusQuery.error instanceof Error ? statusQuery.error.message : null) ||
    (insightsQuery.error instanceof Error ? insightsQuery.error.message : null);

  const refreshAgent = useCallback(
    async (reindex = false) => {
      if (reindex) await reindexAgent();
      await queryClient.invalidateQueries({ queryKey: AGENT_STATUS_KEY });
      await queryClient.invalidateQueries({ queryKey: AGENT_INSIGHTS_KEY });
    },
    [queryClient],
  );

  const chat = useCallback(
    (query: string) =>
      postJson<{ answer: string; matches: SimilarBugMatch[]; source: string }>('/api/agent/chat', { query }),
    [],
  );

  const checkDuplicate = useCallback(
    (payload: Record<string, string>) =>
      postJson<{ matches: SimilarBugMatch[]; recommendation: DuplicateRecommendation }>(
        '/api/agent/duplicate-check',
        payload,
      ),
    [],
  );

  const creationAssist = useCallback(
    (payload: Record<string, string>) =>
      postJson<CreationAssistResult>('/api/agent/creation-assist', payload),
    [],
  );

  const getSummary = useCallback(
    (period: 'daily' | 'weekly' | 'sprint') =>
      getJson<BugSummary>(`/api/agent/summary?period=${period}`),
    [],
  );

  const analyzeDefects = useCallback(
    (payload: { catId: string; issues: Array<Record<string, string>> }) =>
      postJson<DefectBatchResult>('/api/defect/analyze', payload),
    [],
  );

  return {
    status: (statusQuery.data as AgentStatus | undefined) ?? null,
    insights: (insightsQuery.data as AgentInsights | undefined) ?? null,
    loading,
    error,
    refreshAgent,
    chat,
    checkDuplicate,
    creationAssist,
    getSummary,
    analyzeDefects,
  };
}

export function useAgentChat(
  chatFn: (query: string) => Promise<{ answer: string; matches: SimilarBugMatch[]; source: string }>,
  kbReady: boolean,
) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Hi! I am your Bug Intelligence Agent. Describe an issue and I will search live Jira bugs for duplicates and similar patterns.',
    },
  ]);
  const [pending, setPending] = useState(false);

  const send = async (query: string) => {
    if (!query.trim()) return;
    setMessages((m) => [...m, { role: 'user', content: query }]);
    setPending(true);
    try {
      const result = await chatFn(query);
      setMessages((m) => [...m, { role: 'assistant', content: result.answer, matches: result.matches }]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content: kbReady
            ? 'Search failed. Click Refresh to reload live Jira data and try again.'
            : 'Knowledge base is loading from Jira. Wait a moment and try again.',
        },
      ]);
    } finally {
      setPending(false);
    }
  };

  return { messages, send, pending };
}
