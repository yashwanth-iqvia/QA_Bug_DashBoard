import { useState } from 'react';
import { Wand2, AlertCircle, CheckCircle2, Copy, Check } from 'lucide-react';
import { AgentPanelShell, MatchList } from '@/components/agent/BugAgentPanel';
import { Button, Card } from '@/components/ui/Card';
import type { CreationAssistResult } from '@/types/agent';

interface BugCreationAssistantProps {
  onAssist: (payload: Record<string, string>) => Promise<CreationAssistResult>;
}

export function BugCreationAssistant({ onAssist }: BugCreationAssistantProps) {
  const [bugNotes, setBugNotes] = useState('');
  const [oaReportLink, setOaReportLink] = useState('');
  const [screenshots, setScreenshots] = useState('');
  const [cdomVsOa, setCdomVsOa] = useState('');
  const [jiraReferences, setJiraReferences] = useState('');
  const [catId, setCatId] = useState('');
  const [impact, setImpact] = useState('');
  const [expectedBehavior, setExpectedBehavior] = useState('');
  const [actualBehavior, setActualBehavior] = useState('');
  const [title, setTitle] = useState('');
  const [steps, setSteps] = useState('');
  const [result, setResult] = useState<CreationAssistResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      setResult(await onAssist({
        title,
        bugNotes,
        oaReportLink,
        screenshots,
        cdomVsOa,
        jiraReferences,
        catId,
        impact,
        expectedBehavior,
        actualBehavior,
        steps,
      }));
    } finally {
      setLoading(false);
    }
  };

  const copyDraft = async () => {
    if (!result?.jiraDraft) return;
    const d = result.jiraDraft;
    const text = [
      `Project: ${d.project}`,
      `Summary: ${d.summary}`,
      '',
      d.description,
      '',
      `Acceptance Criteria:\n${d.acceptanceCriteria}`,
      '',
      `Labels: ${d.labels.join(', ')}`,
      `Priority: ${d.priority}`,
    ].join('\n');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputClass = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900';
  const labelClass = 'mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400';

  return (
    <AgentPanelShell>
      <div className="space-y-4 overflow-y-auto">
        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3 text-xs text-blue-900 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-200">
          CDOM = expected (master) · OA = product under investigation · Project: BIIH
        </div>

        {/* Layer 1 — User Input */}
        <section className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">1. User Input</h3>
          <div>
            <label className={labelClass}>Bug Notes *</label>
            <textarea className={inputClass} rows={3} placeholder="Describe the issue..." value={bugNotes} onChange={(e) => setBugNotes(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelClass}>CatID</label>
              <input className={inputClass} placeholder="e.g. 1542" value={catId} onChange={(e) => setCatId(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Impact *</label>
              <input className={inputClass} placeholder="e.g. CatID 1542, all bar charts" value={impact} onChange={(e) => setImpact(e.target.value)} />
            </div>
          </div>
          <div>
            <label className={labelClass}>OA Report Link *</label>
            <input className={inputClass} placeholder="https://..." value={oaReportLink} onChange={(e) => setOaReportLink(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>CDOM vs OA Comparison</label>
            <textarea className={inputClass} rows={3} placeholder="CDOM: ...&#10;OA: ..." value={cdomVsOa} onChange={(e) => setCdomVsOa(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelClass}>Expected (CDOM) *</label>
              <input className={inputClass} placeholder="What CDOM shows" value={expectedBehavior} onChange={(e) => setExpectedBehavior(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Actual (OA) *</label>
              <input className={inputClass} placeholder="What OA shows" value={actualBehavior} onChange={(e) => setActualBehavior(e.target.value)} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Screenshots / Evidence</label>
            <input className={inputClass} placeholder="File names or attachment notes" value={screenshots} onChange={(e) => setScreenshots(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Jira References</label>
            <input className={inputClass} placeholder="BIIH-171, BIIH-163" value={jiraReferences} onChange={(e) => setJiraReferences(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Title (optional — auto-generated if blank)</label>
            <input className={inputClass} placeholder="Export - Legend font mismatch" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Steps to Reproduce</label>
            <textarea className={inputClass} rows={2} placeholder="1. Open CatID... 2. Export..." value={steps} onChange={(e) => setSteps(e.target.value)} />
          </div>
        </section>

        <Button onClick={run} disabled={loading}>
          <Wand2 size={16} /> {loading ? 'Analyzing...' : 'Analyze & Build Jira Draft'}
        </Button>

        {result && (
          <>
            {/* Validation / Follow-up questions */}
            {result.validation && !result.validation.complete && (
              <Card className="border-amber-300 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/20">
                <div className="flex items-center gap-2 font-semibold text-amber-800 dark:text-amber-200">
                  <AlertCircle size={18} /> Missing Information — Follow-up Required
                </div>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                  {result.validation.questions.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                  Missing fields: {result.validation.missing.join(', ')}
                </p>
              </Card>
            )}

            {/* Extracted context */}
            {result.extracted && (
              <Card className="p-4">
                <h3 className="font-semibold">2. Extracted Context</h3>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div>Issue Type: <strong>{result.extracted.issueType}</strong></div>
                  <div>CatID: <strong>{result.extracted.catId || '—'}</strong></div>
                  <div className="col-span-2">Expected (CDOM): <strong>{result.extracted.expectedBehavior || '—'}</strong></div>
                  <div className="col-span-2">Actual (OA): <strong>{result.extracted.actualBehavior || '—'}</strong></div>
                  <div className="col-span-2">Impact: <strong>{result.extracted.impact || '—'}</strong></div>
                  <div className="col-span-2 truncate">OA Link: <strong>{result.extracted.oaReportUrl || '—'}</strong></div>
                </div>
              </Card>
            )}

            {/* Status message */}
            <Card className={`p-4 ${result.ready ? 'border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950/20' : 'border-orange-300 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20'}`}>
              <div className="flex items-center gap-2 font-semibold">
                {result.ready ? <CheckCircle2 size={18} className="text-green-600" /> : <AlertCircle size={18} className="text-orange-600" />}
                {result.duplicateCheck.title}
              </div>
              <p className="mt-1 text-sm">{result.message || result.duplicateCheck.message}</p>
              {result.defectAnalysis?.matchingTicket && (
                <p className="mt-1 text-sm">Matching Ticket: <strong>{result.defectAnalysis.matchingTicket}</strong></p>
              )}
            </Card>

            {/* Jira Draft */}
            {result.jiraDraft && result.validation?.complete && (
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Jira Draft ({result.businessRules?.projectKey})</h3>
                  <Button variant="secondary" onClick={copyDraft}>
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied' : 'Copy Draft'}
                  </Button>
                </div>
                <div className="mt-3 space-y-2 text-sm">
                  <p><strong>Summary:</strong> {result.jiraDraft.summary}</p>
                  <p><strong>Priority:</strong> {result.jiraDraft.priority} · <strong>Labels:</strong> {result.jiraDraft.labels.join(', ')}</p>
                  <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-100 p-3 text-xs dark:bg-slate-900">{result.jiraDraft.description}</pre>
                  <p><strong>Acceptance Criteria:</strong></p>
                  <pre className="whitespace-pre-wrap rounded-lg bg-slate-100 p-3 text-xs dark:bg-slate-900">{result.jiraDraft.acceptanceCriteria}</pre>
                </div>
              </Card>
            )}

            {/* Recommendations */}
            {result.validation?.complete && (
              <Card className="p-4">
                <h4 className="font-medium">Recommendations</h4>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div>Priority: <strong>{result.recommendations.priority}</strong></div>
                  <div>Assignee: <strong>{result.recommendations.assignee}</strong></div>
                </div>
                <p className="mt-2 text-sm"><strong>Root Cause Patterns:</strong> {result.recommendations.rootCausePatterns.join(' | ') || '—'}</p>
              </Card>
            )}

            <MatchList matches={result.similarBugs} />
          </>
        )}
      </div>
    </AgentPanelShell>
  );
}
