import { useState } from 'react';
import { ShieldCheck, Plus, Trash2 } from 'lucide-react';
import { AgentPanelShell } from '@/components/agent/BugAgentPanel';
import { Button, Card } from '@/components/ui/Card';
import type { DefectAnalysisResult, DefectBatchResult } from '@/types/agent';

interface IssueRow {
  id: string;
  validationType: string;
  issue: string;
  description: string;
  cdom: string;
  oa: string;
}

interface DefectIntelligencePanelProps {
  onAnalyze: (payload: {
    catId: string;
    issues: Omit<IssueRow, 'id'>[];
  }) => Promise<DefectBatchResult>;
}

const statusColors: Record<string, string> = {
  'Already Logged': 'border-orange-300 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20',
  'Duplicate of Existing Issue': 'border-orange-300 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20',
  'Covered By Parent Defect': 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20',
  'Covered by Existing Jira': 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20',
  'Known DEV Issue': 'border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20',
  'Genuine New Defect': 'border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950/20',
};

function ResultCard({ result, index }: { result: DefectAnalysisResult; index: number }) {
  return (
    <Card className={`p-4 ${statusColors[result.status] || ''}`}>
      <h3 className="font-semibold">Difference {index + 1}</h3>
      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <div><span className="text-slate-500">Category:</span> <strong>{result.category || '—'}</strong></div>
        <div><span className="text-slate-500">Component:</span> <strong>{result.component || '—'}</strong></div>
        <div className="col-span-2"><span className="text-slate-500">CDOM:</span> <strong>{result.cdom || '—'}</strong></div>
        <div className="col-span-2"><span className="text-slate-500">OA:</span> <strong>{result.oa || '—'}</strong></div>
        <div className="col-span-2"><span className="text-slate-500">Issue:</span> {result.issue || '—'}</div>
      </div>

      {result.signature && (
        <p className="mt-2 text-xs text-slate-500">
          Signature: Category={result.signature.category} · Component={result.signature.component} · Property={result.signature.property}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm font-medium">{result.status}</span>
        <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-bold dark:bg-slate-900/80">
          {result.similarityScore}% · {result.tier || result.confidence}
        </span>
      </div>

      {result.matchingTicket && (
        <p className="mt-1 text-sm">
          Ticket:{' '}
          {result.relatedTicket ? (
            <a href={result.relatedTicket.jiraUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
              {result.matchingTicket}
            </a>
          ) : (
            result.matchingTicket
          )}
        </p>
      )}

      {result.similarityBreakdown && (
        <p className="mt-1 text-xs text-slate-500">
          Text {result.similarityBreakdown.textSimilarity}% · Semantic {result.similarityBreakdown.semanticSimilarity}% ·
          Root Cause {result.similarityBreakdown.rootCauseSimilarity}% · Component {result.similarityBreakdown.componentSimilarity}%
        </p>
      )}

      <p className="mt-2 text-sm"><span className="font-medium">Recommendation:</span> {result.recommendation}</p>

      {result.status === 'Genuine New Defect' && (
        <div className="mt-3 space-y-1 border-t border-slate-200 pt-2 text-sm dark:border-slate-700">
          <p><span className="font-medium">Title:</span> {result.title}</p>
          <p><span className="font-medium">Priority:</span> {result.priority}</p>
        </div>
      )}
    </Card>
  );
}

export function DefectIntelligencePanel({ onAnalyze }: DefectIntelligencePanelProps) {
  const [catId, setCatId] = useState('');
  const [issues, setIssues] = useState<IssueRow[]>([
    { id: '1', validationType: 'UI', issue: '', description: '', cdom: '', oa: '' },
  ]);
  const [result, setResult] = useState<DefectBatchResult | null>(null);
  const [loading, setLoading] = useState(false);

  const inputClass = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900';

  const addIssue = () => {
    setIssues((rows) => [...rows, { id: String(Date.now()), validationType: 'UI', issue: '', description: '', cdom: '', oa: '' }]);
  };

  const removeIssue = (id: string) => {
    setIssues((rows) => (rows.length > 1 ? rows.filter((r) => r.id !== id) : rows));
  };

  const updateIssue = (id: string, field: keyof IssueRow, value: string) => {
    setIssues((rows) => rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const data = await onAnalyze({
        catId,
        issues: issues.map(({ validationType, issue, description, cdom, oa }) => ({
          validationType, issue, description, cdom, oa,
        })),
      });
      setResult(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AgentPanelShell>
      <div className="flex h-full flex-col gap-4 overflow-y-auto">
        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3 text-xs text-blue-900 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-200">
          <ShieldCheck size={14} className="mb-1 inline" /> CDOM Export = Master → OA Export → OA UI → Embedded Excel.
          Goal: eliminate duplicates. Only Genuine New Defects (&lt;70% similarity) are recommended.
        </div>

        <input className={inputClass} placeholder="CAT-ID (e.g. 1542)" value={catId} onChange={(e) => setCatId(e.target.value)} />

        {issues.map((row, idx) => (
          <Card key={row.id} className="space-y-2 p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Difference {idx + 1}</span>
              {issues.length > 1 && (
                <button type="button" onClick={() => removeIssue(row.id)} className="text-slate-400 hover:text-red-500">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            <select className={inputClass} value={row.validationType} onChange={(e) => updateIssue(row.id, 'validationType', e.target.value)}>
              <option value="UI">UI Validation</option>
              <option value="Export">Export Validation</option>
              <option value="Excel">Embedded Excel</option>
              <option value="Data">Data Validation</option>
            </select>
            <input className={inputClass} placeholder="Issue (e.g. X-axis labels display in single line)" value={row.issue} onChange={(e) => updateIssue(row.id, 'issue', e.target.value)} />
            <textarea className={inputClass} rows={2} placeholder="Description" value={row.description} onChange={(e) => updateIssue(row.id, 'description', e.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              <input className={inputClass} placeholder="CDOM (master)" value={row.cdom} onChange={(e) => updateIssue(row.id, 'cdom', e.target.value)} />
              <input className={inputClass} placeholder="OA (under test)" value={row.oa} onChange={(e) => updateIssue(row.id, 'oa', e.target.value)} />
            </div>
          </Card>
        ))}

        <div className="flex gap-2">
          <Button variant="secondary" onClick={addIssue}><Plus size={16} /> Add Difference</Button>
          <Button onClick={runAnalysis} disabled={loading || !issues.some((i) => i.issue.trim())}>
            {loading ? 'Analyzing...' : 'Analyze Defects'}
          </Button>
        </div>

        {result && (
          <>
            <Card className="p-3 text-sm">
              <strong>Summary:</strong> {result.summary.total} differences — {result.summary.newDefects} to raise,{' '}
              {result.summary.total - result.summary.newDefects} do not raise
            </Card>
            {result.results.map((r, i) => <ResultCard key={i} result={r} index={i} />)}
            <Card className="p-4">
              <h3 className="font-semibold">FINAL RECOMMENDATION</h3>
              <p className="mt-3 text-sm font-medium uppercase tracking-wide text-orange-700 dark:text-orange-300">Do Not Raise</p>
              <ul className="list-disc pl-5 text-sm">
                {result.finalRecommendation.doNotRaise.length
                  ? result.finalRecommendation.doNotRaise.map((x, i) => <li key={i}>{x}</li>)
                  : <li>None</li>}
              </ul>
              <p className="mt-4 text-sm font-medium uppercase tracking-wide text-green-700 dark:text-green-300">Raise</p>
              <ul className="list-disc pl-5 text-sm">
                {result.finalRecommendation.raise.length
                  ? result.finalRecommendation.raise.map((x, i) => <li key={i}>{x}</li>)
                  : <li>None — no genuine new defects identified</li>}
              </ul>
            </Card>
          </>
        )}
      </div>
    </AgentPanelShell>
  );
}
