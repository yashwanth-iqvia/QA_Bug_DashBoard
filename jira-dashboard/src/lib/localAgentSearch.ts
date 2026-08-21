import type { BugRecord } from '@/types/jira';
import type { SimilarBugMatch } from '@/types/agent';

const STOP = new Set(['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'is', 'are', 'bug', 'issue', 'related', 'going', 'raise', 'am', 'i']);

function tokenize(text: string) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP.has(t));
}

function classifyMatch(score: number) {
  if (score >= 95) return 'Strong Match';
  if (score >= 80) return 'Related Issue';
  if (score >= 60) return 'Possible Related Issue';
  return 'New Issue';
}

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
    matchType: classifyMatch(similarity),
  };
}

function scoreQuery(query: string, bug: BugRecord) {
  const qTokens = new Set(tokenize(query));
  if (!qTokens.size) return 0;

  const haystack = [
    bug.key,
    bug.summary,
    bug.description,
    bug.labels,
    bug.acceptanceCriteria,
    bug.reporter,
    bug.assignee,
  ].join(' ');

  const bTokens = tokenize(haystack);
  if (!bTokens.length) return 0;

  const bSet = new Set(bTokens);
  let overlap = 0;
  qTokens.forEach((t) => {
    if (bSet.has(t)) overlap += 1;
  });

  const ratio = overlap / qTokens.size;
  const summaryBoost = tokenize(bug.summary).some((t) => qTokens.has(t)) ? 0.15 : 0;
  return Math.min(99, Math.round((ratio + summaryBoost) * 100));
}

export function localSearchBugs(bugs: BugRecord[], query: string, limit = 8): SimilarBugMatch[] {
  return bugs
    .map((bug) => ({ bug, similarity: scoreQuery(query, bug) }))
    .filter((x) => x.similarity > 8)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
    .map(({ bug, similarity }) => bugToMatch(bug, similarity));
}

export function localChatAnswer(query: string, bugs: BugRecord[], matches: SimilarBugMatch[]) {
  const lower = query.toLowerCase();

  if (lower.includes('recurring') || lower.includes('top')) {
    const labels = new Map<string, number>();
    bugs.forEach((b) => b.labels.split(', ').filter(Boolean).forEach((l) => labels.set(l, (labels.get(l) || 0) + 1)));
    const top = [...labels.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    return `Top recurring bug themes: ${top.map(([l, c]) => `${l} (${c})`).join(', ') || 'No patterns yet.'}`;
  }

  if (lower.includes('critical') && lower.includes('open')) {
    const critical = bugs.filter(
      (b) => ['Critical', 'Highest', 'Blocker', 'High'].includes(b.priority) && !['Done', 'Closed', 'Resolved'].includes(b.status),
    );
    return critical.length
      ? `Critical/high open bugs: ${critical.slice(0, 8).map((b) => b.key).join(', ')}`
      : 'No critical open bugs found.';
  }

  if (lower.includes('reporter')) {
    const map = new Map<string, number>();
    bugs.forEach((b) => map.set(b.reporter, (map.get(b.reporter) || 0) + 1));
    const top = [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    return `Top reporters: ${top.map(([n, c]) => `${n} (${c})`).join(', ')}`;
  }

  if (matches.length) {
    const top = matches[0];
    const duplicate = top.similarity >= 60;
    return duplicate
      ? `Found ${matches.length} similar bug(s). Best match: ${top.key} (${top.similarity}% - ${top.matchType}). Review existing tickets before creating a new bug.`
      : `Found ${matches.length} loosely related bug(s). Best match: ${top.key} (${top.similarity}%). This may be a new issue area.`;
  }

  return 'No similar bugs found in the current dataset. This appears to be a new issue — you can proceed with bug creation.';
}

export function localDuplicateCheck(bugs: BugRecord[], payload: Record<string, string>) {
  const query = Object.values(payload).filter(Boolean).join(' ');
  const matches = localSearchBugs(bugs, query, 10);
  const top = matches[0];

  if (top && top.similarity >= 60) {
    return {
      matches,
      recommendation: {
        duplicate: true,
        title: 'Potential Duplicate Bugs Found',
        similarity: top.similarity,
        message: 'Existing tickets appear to match this issue. Review them before creating a new bug.',
        existingTickets: matches.filter((m) => m.similarity >= 60),
      },
    };
  }

  return {
    matches,
    recommendation: {
      duplicate: false,
      title: 'No Similar Bugs Found',
      similarity: top?.similarity || 0,
      message: 'This appears to be a new issue. You can proceed with bug creation.',
      existingTickets: matches.slice(0, 3),
    },
  };
}
