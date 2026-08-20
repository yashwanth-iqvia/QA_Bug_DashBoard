import { useCallback, useEffect, useState } from 'react';
import type { BugRecord, JiraIssue } from '@/types/jira';
import { normalizeIssue } from '@/lib/jira-utils';

interface ApiResponse {
  total: number;
  baseUrl: string;
  issues: JiraIssue[];
  syncedAt: string;
  error?: string;
}

const STATIC_MODE = import.meta.env.VITE_STATIC_MODE === 'true';

async function fetchStaticIssues(): Promise<ApiResponse> {
  const url = `${import.meta.env.BASE_URL}data/jira-bugs.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Static Jira data not found. Run GitHub Actions sync first.');
  return res.json();
}

export function useJiraIssues(issueType: 'all' | 'Bug' = 'Bug', autoRefreshMs = 0) {
  const [bugs, setBugs] = useState<BugRecord[]>([]);
  const [allIssues, setAllIssues] = useState<BugRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncedAt, setSyncedAt] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState('');

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let data: ApiResponse;
      if (STATIC_MODE) {
        data = await fetchStaticIssues();
      } else {
        const res = await fetch(`/api/jira/issues?type=${issueType}`);
        data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch issues');
      }
      const normalized = data.issues.map((i) => normalizeIssue(i, data.baseUrl));
      setAllIssues(normalized);
      setBugs(normalized.filter((b) => issueType === 'all' || b.issueType === 'Bug'));
      setSyncedAt(data.syncedAt);
      setBaseUrl(data.baseUrl);
    } catch (e) {
      // GitHub Pages fallback: try static JSON if API unavailable
      if (!STATIC_MODE) {
        try {
          const data = await fetchStaticIssues();
          const normalized = data.issues.map((i) => normalizeIssue(i, data.baseUrl));
          setAllIssues(normalized);
          setBugs(normalized.filter((b) => issueType === 'all' || b.issueType === 'Bug'));
          setSyncedAt(data.syncedAt);
          setBaseUrl(data.baseUrl);
          setError(null);
          return;
        } catch {
          /* fall through */
        }
      }
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [issueType]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  useEffect(() => {
    if (!autoRefreshMs) return;
    const id = setInterval(fetchIssues, autoRefreshMs);
    return () => clearInterval(id);
  }, [autoRefreshMs, fetchIssues]);

  return { bugs, allIssues, loading, error, syncedAt, baseUrl, refresh: fetchIssues };
}
