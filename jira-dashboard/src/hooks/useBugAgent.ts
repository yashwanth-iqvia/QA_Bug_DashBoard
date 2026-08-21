import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { BugRecord } from '@/types/jira';
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
import { STATIC_MODE } from '@/services/jira/apiBase';
import { AGENT_INSIGHTS_KEY, AGENT_STATUS_KEY } from '@/lib/queryClient';
import { localChatAnswer, localDuplicateCheck, localSearchBugs } from '@/lib/localAgentSearch';
import { localAnalyzeBatch } from '@/lib/localDefectAnalysis';
import { localCreationAssist } from '@/lib/localCreationAssist';

const TEN_MINUTES = 10 * 60 * 1000;

function bugToMatch(bug: BugRecord, similarity: number): SimilarBugMatch {
  return {
    key: bug.key,
    summary: bug.summary,
    status: bug.status,
    priority: bug.priority,
    reporter: bug.reporter,
    assignee: bug.assignee,
    labels: bug.labels,
    components: '',
    description: bug.description,
    jiraUrl: bug.jiraUrl,
    similarity,
    matchType: similarity >= 80 ? 'Strong Match' : 'Related Issue',
  };
}

export function useBugAgent(
  bugs: BugRecord[],
  autoRefreshMs = TEN_MINUTES,
  dataSyncedAt: string | null = null,
) {
  const bugsRef = useRef(bugs);
  bugsRef.current = bugs;
  const syncedAtRef = useRef(dataSyncedAt);
  syncedAtRef.current = dataSyncedAt;

  const queryClient = useQueryClient();
  const [usingLocalFallback, setUsingLocalFallback] = useState(STATIC_MODE);
  const [localStatus, setLocalStatus] = useState<AgentStatus | null>(null);
  const [localInsights, setLocalInsights] = useState<AgentInsights | null>(null);

  const statusQuery = useQuery({
    queryKey: AGENT_STATUS_KEY,
    queryFn: fetchAgentStatus,
    enabled: !STATIC_MODE,
    refetchInterval: !STATIC_MODE && autoRefreshMs > 0 ? autoRefreshMs : false,
  });

  const insightsQuery = useQuery({
    queryKey: AGENT_INSIGHTS_KEY,
    queryFn: fetchAgentInsights,
    enabled: !STATIC_MODE,
    refetchInterval: !STATIC_MODE && autoRefreshMs > 0 ? autoRefreshMs : false,
  });

  const buildLocalInsights = useCallback((): AgentInsights => {
    const records = bugsRef.current;
    const labelCounts = new Map<string, number>();
    records.forEach((r) =>
      r.labels
        .split(', ')
        .filter((l) => l && l !== 'None')
        .forEach((l) => labelCounts.set(l, (labelCounts.get(l) || 0) + 1)),
    );

    const reporterCounts = new Map<string, number>();
    records.forEach((r) => reporterCounts.set(r.reporter, (reporterCounts.get(r.reporter) || 0) + 1));

    const recentSimilar = records.length
      ? localSearchBugs(records, 'export ui chart alignment tooltip legend excel data', 5).map((m) =>
          bugToMatch(records.find((b) => b.key === m.key) || records[0], m.similarity),
        )
      : [];

    return {
      potentialDuplicates: recentSimilar.filter((m) => m.similarity >= 75).length,
      mostRepeatedIssues: [...labelCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count })),
      topProblemModules: [...labelCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, count]) => ({ name, count })),
      aiRiskDetection: records.filter(
        (r) =>
          ['Critical', 'High', 'Highest'].includes(r.priority) &&
          !['Done', 'Closed', 'Resolved'].includes(r.status),
      ).length,
      recentlySimilarBugs: recentSimilar,
      criticalOpen: records
        .filter(
          (r) =>
            ['Critical', 'High', 'Highest'].includes(r.priority) &&
            !['Done', 'Closed', 'Resolved'].includes(r.status),
        )
        .slice(0, 5)
        .map((r) => bugToMatch(r, 100)),
      topReporters: [...reporterCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count })),
    };
  }, []);

  const applyLocalAgent = useCallback(() => {
    setUsingLocalFallback(true);
    setLocalStatus({
      indexed: bugsRef.current.length,
      lastIndexedAt: syncedAtRef.current || new Date().toISOString(),
      indexing: false,
      aiProvider: STATIC_MODE ? 'github-pages' : 'local-fallback',
      refreshIntervalMinutes: 15,
    });
    setLocalInsights(buildLocalInsights());
  }, [buildLocalInsights]);

  useEffect(() => {
    if (STATIC_MODE && bugs.length) applyLocalAgent();
  }, [bugs.length, dataSyncedAt, applyLocalAgent]);

  const loading =
    !STATIC_MODE &&
    (statusQuery.isLoading ||
      statusQuery.isFetching ||
      insightsQuery.isLoading ||
      insightsQuery.isFetching);

  const error =
    !STATIC_MODE &&
    ((statusQuery.error instanceof Error ? statusQuery.error.message : null) ||
      (insightsQuery.error instanceof Error ? insightsQuery.error.message : null));

  const refreshAgent = useCallback(
    async (reindex = false) => {
      if (STATIC_MODE) {
        applyLocalAgent();
        return;
      }
      if (reindex) await reindexAgent();
      await queryClient.invalidateQueries({ queryKey: AGENT_STATUS_KEY });
      await queryClient.invalidateQueries({ queryKey: AGENT_INSIGHTS_KEY });
    },
    [queryClient, applyLocalAgent],
  );

  const chat = useCallback(async (query: string) => {
    if (!STATIC_MODE) {
      return postJson<{ answer: string; matches: SimilarBugMatch[]; source: string }>(
        '/api/agent/chat',
        { query },
      );
    }
    const matches = localSearchBugs(bugsRef.current, query, 8);
    return {
      answer: localChatAnswer(query, bugsRef.current, matches),
      matches,
      source: 'github-pages',
    };
  }, []);

  const checkDuplicate = useCallback(async (payload: Record<string, string>) => {
    if (!STATIC_MODE) {
      return postJson<{ matches: SimilarBugMatch[]; recommendation: DuplicateRecommendation }>(
        '/api/agent/duplicate-check',
        payload,
      );
    }
    return localDuplicateCheck(bugsRef.current, payload);
  }, []);

  const creationAssist = useCallback(async (payload: Record<string, string>) => {
    if (!STATIC_MODE) {
      return postJson<CreationAssistResult>('/api/agent/creation-assist', payload);
    }
    return localCreationAssist(bugsRef.current, payload);
  }, []);

  const getSummary = useCallback(async (period: 'daily' | 'weekly' | 'sprint') => {
    if (!STATIC_MODE) {
      return getJson<BugSummary>(`/api/agent/summary?period=${period}`);
    }
    const now = new Date();
    const cutoff = new Date(now);
    if (period === 'daily') cutoff.setDate(now.getDate() - 1);
    else if (period === 'weekly') cutoff.setDate(now.getDate() - 7);
    else cutoff.setDate(now.getDate() - 14);

    const inPeriod = bugsRef.current.filter((b) => new Date(b.created) >= cutoff);
    return {
      period,
      generatedAt: now.toISOString(),
      newBugs: inPeriod.length,
      closedBugs: bugsRef.current.filter(
        (b) => b.resolutionDate && new Date(b.resolutionDate) >= cutoff,
      ).length,
      criticalBugs: inPeriod.filter((b) => ['Critical', 'Highest'].includes(b.priority)).length,
      topProblemAreas: [],
      trend: `${inPeriod.length} new bugs in period`,
      criticalList: [],
    };
  }, []);

  const analyzeDefects = useCallback(
    async (payload: { catId: string; issues: Array<Record<string, string>> }) => {
      if (!STATIC_MODE) {
        return postJson<DefectBatchResult>('/api/defect/analyze', payload);
      }
      return localAnalyzeBatch(
        bugsRef.current,
        payload.issues as Array<{
          issue: string;
          description?: string;
          cdom?: string;
          oa?: string;
          validationType?: string;
        }>,
        payload.catId,
      );
    },
    [],
  );

  return {
    status: STATIC_MODE
      ? localStatus
      : ((statusQuery.data as AgentStatus | undefined) ?? null),
    insights: STATIC_MODE
      ? localInsights
      : ((insightsQuery.data as AgentInsights | undefined) ?? null),
    loading: Boolean(loading),
    error: error || null,
    usingLocalFallback,
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
        'Hi! I am your Bug Intelligence Agent. Describe an issue and I will search Jira bugs for duplicates and similar patterns.',
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
            ? 'Search failed. Click Refresh to reload data and try again.'
            : 'Data is still loading. Wait a moment and try again.',
        },
      ]);
    } finally {
      setPending(false);
    }
  };

  return { messages, send, pending };
}
