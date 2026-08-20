import type {
  ReleaseFilters,
  ReleaseStory,
  ReleaseSummaryStats,
} from '@/types/releases';
import { isCompletedStatus, isInProgressStatus } from '@/types/releases';

export function applyReleaseFilters(stories: ReleaseStory[], filters: ReleaseFilters): ReleaseStory[] {
  const q = filters.search.trim().toLowerCase();

  return stories.filter((story) => {
    if (q) {
      const hay = [
        story.key,
        story.catId || '',
        story.catIdLabel || '',
        story.summary,
        story.assignee,
        story.sprint,
        ...story.subtasks.map((st) => `${st.key} ${st.catId || ''} ${st.catIdLabel || ''} ${st.summary}`),
      ]
        .join(' ')
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }

    if (filters.status !== 'all' && story.status !== filters.status) return false;
    if (filters.assignee !== 'all' && story.assignee !== filters.assignee) return false;
    if (filters.sprint !== 'all' && story.sprint !== filters.sprint) return false;

    return true;
  });
}

export function computeReleaseSummary(stories: ReleaseStory[]): ReleaseSummaryStats {
  return {
    totalStories: stories.length,
    totalSubtasks: stories.reduce((n, s) => n + s.subtasks.length, 0),
    completedStories: stories.filter((s) => isCompletedStatus(s.status)).length,
    inProgressStories: stories.filter((s) => isInProgressStatus(s.status)).length,
    pendingStories: stories.filter(
      (s) => !isCompletedStatus(s.status) && !isInProgressStatus(s.status),
    ).length,
  };
}

export function uniqueValues(stories: ReleaseStory[], field: 'status' | 'assignee' | 'sprint') {
  const set = new Set<string>();
  stories.forEach((s) => {
    const v = s[field];
    if (v && v !== '—') set.add(v);
  });
  return [...set].sort((a, b) => a.localeCompare(b));
}

export function completedSubtaskCount(story: ReleaseStory) {
  return story.subtasks.filter((st) => isCompletedStatus(st.status)).length;
}
