import { ExternalLink, ChevronDown, ChevronRight, User, Flag, Hash } from 'lucide-react';
import { Badge, Card } from '@/components/ui/Card';
import type { ReleaseStory, ReleaseSubtask } from '@/types/releases';
import { storyStatusColor } from '@/types/releases';
import { cn } from '@/lib/utils';
import { completedSubtaskCount } from '@/lib/release-utils';

const STATUS_BADGE: Record<string, string> = {
  todo: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  testing: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  done: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  blocked: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

function StatusBadge({ status }: { status: string }) {
  const color = storyStatusColor(status);
  return (
    <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', STATUS_BADGE[color] || STATUS_BADGE.todo)}>
      {status}
    </span>
  );
}

function JiraLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 font-medium text-blue-600 hover:underline dark:text-blue-400"
      onClick={(e) => e.stopPropagation()}
    >
      🔗 {label} <ExternalLink size={12} />
    </a>
  );
}

interface StoryCardProps {
  story: ReleaseStory;
  expanded: boolean;
  onToggle: () => void;
}

export function StoryCard({ story, expanded, onToggle }: StoryCardProps) {
  const doneSubs = completedSubtaskCount(story);
  const displayId = story.catIdLabel || story.key;

  return (
    <Card className="overflow-hidden p-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-3 px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50"
      >
        <span className="mt-1 text-slate-400">
          {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </span>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-blue-700 dark:text-blue-300">{displayId}</span>
            <span className="text-xs text-slate-400">({story.key})</span>
            <StatusBadge status={story.status} />
            {story.priority !== '—' && (
              <Badge color={priorityBadgeColor(story.priority)}>{story.priority}</Badge>
            )}
          </div>
          <p className="text-base font-semibold text-slate-900 dark:text-white">{story.summary}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1">
              <User size={12} /> {story.assignee}
            </span>
            <span className="inline-flex items-center gap-1">
              <Flag size={12} /> Sprint: {story.sprint}
            </span>
            <span className="inline-flex items-center gap-1">
              <Hash size={12} /> Points: {story.storyPoints}
            </span>
            <span>
              Subtasks: {doneSubs}/{story.subtasks.length}
            </span>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-slate-100 px-5 py-4 dark:border-slate-800">
          <div className="mb-3 space-y-1 text-sm">
            <p className="font-semibold text-slate-700 dark:text-slate-200">Story:</p>
            <p>
              <JiraLink href={story.jiraUrl} label={displayId} />
              <span className="ml-2 text-xs text-slate-400">{story.key}</span>
            </p>
            <p className="text-slate-600 dark:text-slate-300">
              <span className="font-medium">Summary:</span> {story.summary}
            </p>
            <p className="flex flex-wrap items-center gap-2 text-slate-600 dark:text-slate-300">
              <span className="font-medium">Status:</span> <StatusBadge status={story.status} />
            </p>
            <p className="text-slate-600 dark:text-slate-300">
              <span className="font-medium">Assignee:</span> {story.assignee}
            </p>
            <p className="text-slate-600 dark:text-slate-300">
              <span className="font-medium">Release:</span> {story.release}
            </p>
          </div>

          <div>
            <p className="mb-2 font-semibold text-slate-700 dark:text-slate-200">Subtasks:</p>
            {story.subtasks.length === 0 ? (
              <p className="text-sm text-slate-400">No subtasks linked.</p>
            ) : (
              <ul className="space-y-3 border-l-2 border-slate-200 pl-4 dark:border-slate-700">
                {story.subtasks.map((st) => (
                  <SubtaskRow key={st.key} subtask={st} />
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

function SubtaskRow({ subtask }: { subtask: ReleaseSubtask }) {
  const label = subtask.catIdLabel || subtask.key;
  return (
    <li className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
      <p>
        <JiraLink href={subtask.jiraUrl} label={label} />
        {subtask.catIdLabel && (
          <span className="ml-2 text-xs text-slate-400">{subtask.key}</span>
        )}
      </p>
      <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
        <span className="font-medium">Summary:</span> {subtask.summary}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <StatusBadge status={subtask.status} />
        <span className="inline-flex items-center gap-1">
          <User size={12} /> {subtask.assignee}
        </span>
      </div>
    </li>
  );
}

function priorityBadgeColor(priority: string) {
  const p = priority.toLowerCase();
  if (p.includes('critical') || p.includes('highest') || p.includes('blocker')) return 'critical';
  if (p.includes('high')) return 'high';
  if (p.includes('medium')) return 'medium';
  if (p.includes('low')) return 'low';
  return 'slate';
}

interface ReleaseTreeProps {
  stories: ReleaseStory[];
  expandedKeys: Set<string>;
  onToggle: (key: string) => void;
}

export function ReleaseTree({ stories, expandedKeys, onToggle }: ReleaseTreeProps) {
  return (
    <div className="space-y-3">
      {stories.map((story) => (
        <StoryCard
          key={story.key}
          story={story}
          expanded={expandedKeys.has(story.key)}
          onToggle={() => onToggle(story.key)}
        />
      ))}
    </div>
  );
}

interface ReleaseGridProps {
  stories: ReleaseStory[];
}

export function ReleaseGrid({ stories }: ReleaseGridProps) {
  return (
    <Card className="overflow-x-auto p-0">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-400">
          <tr>
            <th className="px-4 py-3 font-semibold">CAT-ID</th>
            <th className="px-4 py-3 font-semibold">Story</th>
            <th className="px-4 py-3 font-semibold">Summary</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Assignee</th>
            <th className="px-4 py-3 font-semibold">Total Subtasks</th>
            <th className="px-4 py-3 font-semibold">Completed Subtasks</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {stories.map((story) => (
            <tr key={story.key} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
              <td className="px-4 py-3 whitespace-nowrap font-semibold text-blue-700 dark:text-blue-300">
                {story.catIdLabel || '—'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <a
                  href={story.jiraUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                >
                  {story.key}
                </a>
              </td>
              <td className="max-w-md px-4 py-3 text-slate-700 dark:text-slate-200">{story.summary}</td>
              <td className="px-4 py-3">
                <StatusBadge status={story.status} />
              </td>
              <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{story.assignee}</td>
              <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{story.subtasks.length}</td>
              <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                {completedSubtaskCount(story)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
