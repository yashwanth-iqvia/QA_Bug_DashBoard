import { useEffect, useState } from 'react';
import { Share2, Copy, Check, X } from 'lucide-react';

interface ShareInfo {
  name: string;
  localUrl: string;
  teamUrls: string[];
  note: string;
}

export function ShareTeamDialog() {
  const [open, setOpen] = useState(false);
  const [info, setInfo] = useState<ShareInfo | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    fetch('/api/share-info')
      .then((r) => (r.ok ? r.json() : null))
      .then(setInfo)
      .catch(() => undefined);
  }, [open]);

  const copy = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  };

  const teamUrls = info?.teamUrls.filter((u) => !u.includes('localhost')) || [];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        <Share2 size={16} /> Share with Team
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Share with Team</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Share your local dashboard URL with colleagues on the same network.
                </p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X size={20} />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Live Jira data requires the API server. Run <code className="text-xs">npm run dev</code> and share one of these URLs:
              </p>
              {teamUrls.length ? (
                teamUrls.map((url) => (
                  <div key={url} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
                    <code className="flex-1 break-all text-sm">{url}</code>
                    <button type="button" onClick={() => copy(url)} className="shrink-0 rounded-lg border px-2 py-1 text-xs">
                      {copied === url ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500">Run npm run dev to detect local network URL.</p>
              )}
              {info?.note && (
                <p className="text-xs text-slate-500">{info.note}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
