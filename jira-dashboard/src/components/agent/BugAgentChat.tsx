import { useState } from 'react';
import { Send, Loader2, Sparkles } from 'lucide-react';
import { AgentPanelShell, MatchList } from '@/components/agent/BugAgentPanel';
import { Button } from '@/components/ui/Card';
import { useAgentChat } from '@/hooks/useBugAgent';
import type { SimilarBugMatch } from '@/types/agent';

interface BugAgentChatProps {
  onChat: (query: string) => Promise<{ answer: string; matches: SimilarBugMatch[]; source: string }>;
  kbReady: boolean;
}

const suggestions = [
  'I am going to raise a bug related to login failure.',
  'Application crashes while uploading files.',
  'Payment screen is stuck during checkout.',
  'What are the top recurring bugs?',
  'Show critical open bugs.',
  'Which reporter raised most bugs?',
];

export function BugAgentChat({ onChat, kbReady }: BugAgentChatProps) {
  const { messages, send, pending } = useAgentChat(onChat, kbReady);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    const q = input.trim();
    if (!q) return;
    setInput('');
    await send(q);
  };

  return (
    <AgentPanelShell>
      <div className="mb-4 flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => send(s)}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 shadow-sm transition hover:border-blue-400 hover:bg-blue-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-blue-500"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                msg.role === 'user'
                  ? 'rounded-br-md bg-blue-600 text-white'
                  : 'rounded-bl-md border border-slate-200 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="mb-1 flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                  <Sparkles size={12} /> Bug Intelligence Agent
                </div>
              )}
              <p className="whitespace-pre-wrap">{msg.content}</p>
              {msg.matches && msg.matches.length > 0 && <MatchList matches={msg.matches} />}
            </div>
          </div>
        ))}
        {pending && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 size={16} className="animate-spin" /> Searching Jira bugs...
          </div>
        )}
      </div>

      <div className="mt-4 shrink-0 border-t border-slate-200 pt-4 dark:border-slate-700">
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-900 dark:focus:ring-blue-900"
            placeholder="Describe the issue you want to raise..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          />
          <Button onClick={handleSend} disabled={pending} className="rounded-xl px-5 py-3">
            <Send size={18} />
          </Button>
        </div>
      </div>
    </AgentPanelShell>
  );
}
