import { Bot, MessageSquare, Copy, FilePlus, Sparkles, X, RefreshCw, ShieldCheck } from 'lucide-react';
import { BugAgentChat } from '@/components/agent/BugAgentChat';
import { DuplicateDetectionPanel } from '@/components/agent/DuplicateDetectionPanel';
import { BugCreationAssistant } from '@/components/agent/BugCreationAssistant';
import { AgentSummaries } from '@/components/agent/AgentSummaries';
import { DefectIntelligencePanel } from '@/components/agent/DefectIntelligencePanel';
import type { useBugAgent } from '@/hooks/useBugAgent';

export type AgentTab = 'chat' | 'defect' | 'duplicate' | 'create' | 'summaries';

interface BugAgentPanelProps {
  open: boolean;
  activeTab: AgentTab;
  onTabChange: (tab: AgentTab) => void;
  onClose: () => void;
  onRefresh: () => void;
  agent: ReturnType<typeof useBugAgent>;
  loading?: boolean;
}

const tabs: { id: AgentTab; label: string; icon: React.ReactNode }[] = [
  { id: 'chat', label: 'Search Assistant', icon: <MessageSquare size={18} /> },
  { id: 'defect', label: 'QA Defect Intel', icon: <ShieldCheck size={18} /> },
  { id: 'duplicate', label: 'Duplicate Check', icon: <Copy size={18} /> },
  { id: 'create', label: 'Creation Assist', icon: <FilePlus size={18} /> },
  { id: 'summaries', label: 'AI Summaries', icon: <Sparkles size={18} /> },
];

export function BugAgentPanel({
  open,
  activeTab,
  onTabChange,
  onClose,
  onRefresh,
  agent,
  loading,
}: BugAgentPanelProps) {
  if (!open) return null;

  return (
    <aside className="fixed inset-y-0 right-0 z-40 flex w-1/2 min-w-[520px] flex-col border-l border-slate-200 bg-gradient-to-b from-white to-slate-50 shadow-2xl dark:border-slate-700 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white/90 px-6 py-4 backdrop-blur dark:border-slate-700 dark:bg-slate-950/90">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md">
            <Bot size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Bug Intelligence Agent</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {agent.status?.indexed ? `${agent.status.indexed} bugs indexed` : 'Syncing knowledge base...'}
              {agent.status?.lastIndexedAt && ` · ${new Date(agent.status.lastIndexedAt).toLocaleTimeString()}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            title="Refresh knowledge base"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <nav className="flex shrink-0 gap-1 border-b border-slate-200 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-950">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            {tab.icon}
            <span className="hidden lg:inline">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Content */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {activeTab === 'chat' && <BugAgentChat onChat={agent.chat} kbReady={(agent.status?.indexed || 0) > 0} />}
        {activeTab === 'defect' && <DefectIntelligencePanel onAnalyze={agent.analyzeDefects} />}
        {activeTab === 'duplicate' && <DuplicateDetectionPanel onCheck={agent.checkDuplicate} />}
        {activeTab === 'create' && <BugCreationAssistant onAssist={agent.creationAssist} />}
        {activeTab === 'summaries' && <AgentSummaries onSummary={agent.getSummary} />}
      </div>
    </aside>
  );
}

export function MatchList({
  matches,
}: {
  matches: Array<{
    key: string;
    summary: string;
    status: string;
    priority: string;
    reporter: string;
    assignee: string;
    similarity: number;
    jiraUrl: string;
    matchType?: string;
  }>;
}) {
  if (!matches?.length) return null;

  return (
    <div className="mt-3 space-y-2">
      {matches.map((m) => (
        <div
          key={m.key}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-700"
        >
          <div className="flex items-start justify-between gap-3">
            <a href={m.jiraUrl} target="_blank" rel="noreferrer" className="text-base font-semibold text-blue-600 hover:underline">
              {m.key}
            </a>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                m.similarity >= 80
                  ? 'bg-red-100 text-red-700'
                  : m.similarity >= 60
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-blue-100 text-blue-700'
              }`}
            >
              {m.similarity}%
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200">{m.summary}</p>
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-500">
            <span>Status: {m.status}</span>
            <span>Priority: {m.priority}</span>
            <span>Reporter: {m.reporter}</span>
            <span>Assignee: {m.assignee}</span>
          </div>
          {m.matchType && <p className="mt-2 text-xs font-medium text-slate-400">{m.matchType}</p>}
        </div>
      ))}
    </div>
  );
}

export function AgentPanelShell({ children }: { children: React.ReactNode }) {
  return <div className="flex h-full min-h-0 flex-col overflow-hidden p-5">{children}</div>;
}
