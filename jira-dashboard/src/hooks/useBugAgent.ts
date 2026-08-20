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
import { localChatAnswer, localDuplicateCheck, localSearchBugs } from '@/lib/localAgentSearch';
import { localAnalyzeBatch } from '@/lib/localDefectAnalysis';
import { localCreationAssist } from '@/lib/localCreationAssist';

const STATIC_MODE = import.meta.env.VITE_STATIC_MODE === 'true';

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

export function useBugAgent(bugs: BugRecord[], autoRefreshMs = 2 * 60 * 60 * 1000) {
  const bugsRef = useRef(bugs);
  bugsRef.current = bugs;

  const [status, setStatus] = useState<AgentStatus | null>(null);
  const [insights, setInsights] = useState<AgentInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingLocalFallback, setUsingLocalFallback] = useState(false);

  const fetchStatus = useCallback(async () => {
    const res = await fetch('/api/agent/status');
    if (!res.ok) throw new Error('agent-status-unavailable');
    setStatus(await res.json());
    setUsingLocalFallback(false);
  }, []);

  const fetchInsights = useCallback(async () => {
    const res = await fetch('/api/agent/insights');
    if (!res.ok) throw new Error('agent-insights-unavailable');
    setInsights(await res.json());
  }, []);

  const buildLocalInsights = useCallback((): AgentInsights => {
    const records = bugsRef.current;
    const labelCounts = new Map<string, number>();
    records.forEach((r) => r.labels.split(', ').filter((l) => l && l !== 'None').forEach((l) => labelCounts.set(l, (labelCounts.get(l) || 0) + 1)));

    const reporterCounts = new Map<string, number>();
    records.forEach((r) => reporterCounts.set(r.reporter, (reporterCounts.get(r.reporter) || 0) + 1));

    const recentSimilar = records.length
      ? localSearchBugs(records, 'export ui chart alignment tooltip legend excel data', 5).map((m) => bugToMatch(
          records.find((b) => b.key === m.key) || records[0],
          m.similarity,
        ))
      : [];

    return {
      potentialDuplicates: recentSimilar.filter((m) => m.similarity >= 75).length,
      mostRepeatedIssues: [...labelCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count })),
      topProblemModules: [...labelCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([name, count]) => ({ name, count })),
      aiRiskDetection: records.filter((r) => ['Critical', 'High', 'Highest'].includes(r.priority) && !['Done', 'Closed', 'Resolved'].includes(r.status)).length,
      recentlySimilarBugs: recentSimilar,
      criticalOpen: records
        .filter((r) => ['Critical', 'High', 'Highest'].includes(r.priority) && !['Done', 'Closed', 'Resolved'].includes(r.status))
        .slice(0, 5)
        .map((r) => bugToMatch(r, 100)),
      topReporters: [...reporterCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count })),
    };
  }, []);

  const applyLocalAgent = useCallback(() => {
    setUsingLocalFallback(true);
    setStatus({
      indexed: bugsRef.current.length,
      lastIndexedAt: new Date().toISOString(),
      indexing: false,
      aiProvider: STATIC_MODE ? 'github-pages-local' : 'local-fallback',
      refreshIntervalHours: 2,
    });
    setInsights(buildLocalInsights());
    setError(null);
  }, [buildLocalInsights]);

  const refreshAgent = useCallback(async (reindex = false) => {
    if (STATIC_MODE || !bugsRef.current.length) {
      applyLocalAgent();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (reindex) {
        const res = await fetch('/api/agent/reindex', { method: 'POST' });
        if (!res.ok) throw new Error('reindex-failed');
      }
      await Promise.all([fetchStatus(), fetchInsights()]);
      setUsingLocalFallback(false);
    } catch {
      applyLocalAgent();
    } finally {
      setLoading(false);
    }
  }, [fetchStatus, fetchInsights, applyLocalAgent]);

  useEffect(() => {
    refreshAgent(false).catch(() => undefined);
  }, [refreshAgent]);

  useEffect(() => {
    if (STATIC_MODE && bugs.length) {
      applyLocalAgent();
    }
  }, [bugs.length, applyLocalAgent]);

  useEffect(() => {
    if (!autoRefreshMs) return;
    const id = setInterval(() => refreshAgent(true).catch(() => undefined), autoRefreshMs);
    return () => clearInterval(id);
  }, [autoRefreshMs, refreshAgent]);

  const chat = useCallback(async (query: string) => {
    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      if (!res.ok) throw new Error('Chat failed');
      return res.json() as Promise<{ answer: string; matches: SimilarBugMatch[]; source: string }>;
    } catch {
      const matches = localSearchBugs(bugsRef.current, query, 8);
      return {
        answer: localChatAnswer(query, bugsRef.current, matches),
        matches,
        source: 'local-fallback',
      };
    }
  }, []);

  const checkDuplicate = useCallback(async (payload: Record<string, string>) => {
    try {
      const res = await fetch('/api/agent/duplicate-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Duplicate check failed');
      return res.json() as Promise<{ matches: SimilarBugMatch[]; recommendation: DuplicateRecommendation }>;
    } catch {
      return localDuplicateCheck(bugsRef.current, payload);
    }
  }, []);

  const creationAssist = useCallback(async (payload: Record<string, string>) => {
    try {
      const res = await fetch('/api/agent/creation-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Creation assist failed');
      return res.json() as Promise<CreationAssistResult>;
    } catch {
      return localCreationAssist(bugsRef.current, payload);
    }
  }, []);

  const getSummary = useCallback(async (period: 'daily' | 'weekly' | 'sprint') => {
    try {
      const res = await fetch(`/api/agent/summary?period=${period}`);
      if (!res.ok) throw new Error('Summary failed');
      return res.json() as Promise<BugSummary>;
    } catch {
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
        closedBugs: bugsRef.current.filter((b) => b.resolutionDate && new Date(b.resolutionDate) >= cutoff).length,
        criticalBugs: inPeriod.filter((b) => ['Critical', 'Highest'].includes(b.priority)).length,
        topProblemAreas: [],
        trend: `${inPeriod.length} new bugs in period`,
        criticalList: [],
      };
    }
  }, []);

  const analyzeDefects = useCallback(async (payload: { catId: string; issues: Array<Record<string, string>> }) => {
    try {
      const res = await fetch('/api/defect/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Defect analysis failed');
      return res.json() as Promise<DefectBatchResult>;
    } catch {
      return localAnalyzeBatch(bugsRef.current, payload.issues as Array<{ issue: string; description?: string; cdom?: string; oa?: string; validationType?: string }>, payload.catId);
    }
  }, []);

  return {
    status,
    insights,
    loading,
    error,
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
      content: 'Hi! I am your Bug Intelligence Agent. Describe an issue and I will search existing Jira bugs for duplicates and similar patterns.',
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
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content: kbReady
            ? 'Search failed unexpectedly. Please try again or click Refresh.'
            : 'Knowledge base is still loading. Wait a moment and try again, or click Refresh.',
        },
      ]);
    } finally {
      setPending(false);
    }
  };

  return { messages, send, pending };
}
