import { useState } from 'react';
import { Search } from 'lucide-react';
import { AgentPanelShell, MatchList } from '@/components/agent/BugAgentPanel';
import { Button, Card } from '@/components/ui/Card';
import type { DuplicateRecommendation, SimilarBugMatch } from '@/types/agent';

interface DuplicateDetectionPanelProps {
  onCheck: (payload: Record<string, string>) => Promise<{ matches: SimilarBugMatch[]; recommendation: DuplicateRecommendation }>;
}

export function DuplicateDetectionPanel({ onCheck }: DuplicateDetectionPanelProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [module, setModule] = useState('');
  const [keywords, setKeywords] = useState('');
  const [result, setResult] = useState<{ matches: SimilarBugMatch[]; recommendation: DuplicateRecommendation } | null>(null);
  const [loading, setLoading] = useState(false);

  const runCheck = async () => {
    setLoading(true);
    try {
      const data = await onCheck({ title, description, errorMessage, module, keywords });
      setResult(data);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900';

  return (
    <AgentPanelShell>
      <div className="space-y-3 overflow-y-auto">
        <input className={inputClass} placeholder="Bug title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea className={inputClass} rows={4} placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <input className={inputClass} placeholder="Error message" value={errorMessage} onChange={(e) => setErrorMessage(e.target.value)} />
        <input className={inputClass} placeholder="Module name" value={module} onChange={(e) => setModule(e.target.value)} />
        <input className={inputClass} placeholder="Keywords" value={keywords} onChange={(e) => setKeywords(e.target.value)} />
        <Button onClick={runCheck} disabled={loading}>
          <Search size={16} /> {loading ? 'Analyzing...' : 'Check for Duplicates'}
        </Button>

        {result && (
          <Card className={`p-4 ${result.recommendation.duplicate ? 'border-orange-300 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20' : 'border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950/20'}`}>
            <h3 className="font-semibold">{result.recommendation.title}</h3>
            {result.recommendation.similarity != null && (
              <p className="mt-1 text-sm">Similarity: {result.recommendation.similarity}%</p>
            )}
            <p className="mt-2 text-sm">{result.recommendation.message}</p>
            {result.recommendation.existingTickets && result.recommendation.existingTickets.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium">Existing Tickets:</p>
                <ul className="mt-1 list-disc pl-5 text-sm">
                  {result.recommendation.existingTickets.map((t) => (
                    <li key={t.key}>
                      <a href={t.jiraUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{t.key}</a> — {t.status}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        )}

        {result?.matches && <MatchList matches={result.matches} />}
      </div>
    </AgentPanelShell>
  );
}
