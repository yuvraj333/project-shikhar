'use client';

import { AlertTriangle, Loader2, XCircle, RefreshCw, ShieldCheck } from 'lucide-react';

interface CommandCenterProps {
  reportText: string;
  setReportText: (text: string) => void;
  isProcessing: boolean;
  error: string | null;
  hasResults: boolean;
  onRunPipeline: () => void;
  onReset: () => void;
}

export function CommandCenter({
  reportText,
  setReportText,
  isProcessing,
  error,
  hasResults,
  onRunPipeline,
  onReset,
}: CommandCenterProps) {
  return (
    <aside className="space-y-6 xl:col-span-4">
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <h2 className="mb-2 flex items-center gap-2.5 text-lg font-bold text-white">
          <AlertTriangle className="h-5 w-5 text-amber-400" />
          Incoming Field Report
        </h2>

        <p className="mb-5 text-sm leading-relaxed text-slate-400">
          Paste raw unstructured dispatches here. The ADK multi-agent pipeline extracts verifiable evidence and inventory shortfalls.
        </p>

        <label
          htmlFor="incident-report"
          className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400"
        >
          Incident Dispatch Stream
        </label>

        <textarea
          id="incident-report"
          className="h-48 w-full resize-y rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm leading-relaxed text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-inner"
          placeholder="e.g., A severe landslide has hit Nakkhu in Lalitpur district. 4 people are reported trapped in a tin-roofed house..."
          value={reportText}
          onChange={(event) => setReportText(event.target.value)}
          disabled={isProcessing}
        />

        <div className="mt-2 flex justify-between items-center text-xs text-slate-500">
          <span>Min. 10 chars recommended</span>
          <span>{reportText.length} chars</span>
        </div>

        <button
          onClick={onRunPipeline}
          disabled={isProcessing || !reportText.trim()}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 font-semibold text-white transition-all hover:bg-indigo-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500 shadow-lg shadow-indigo-900/30"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Executing Multi-Agent Pipeline...
            </>
          ) : (
            'Process Intelligence'
          )}
        </button>

        {hasResults && !isProcessing && (
          <button
            onClick={onReset}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Clear & New Report
          </button>
        )}
      </section>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300 shadow-lg animate-in fade-in"
        >
          <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Pipeline Error</p>
            <p className="mt-1 break-words leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Operator SOP */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-300">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          Operator Standard Operating Procedures
        </h3>

        <ol className="space-y-3.5 text-sm leading-relaxed text-slate-400">
          <li className="flex items-start gap-3">
            <span className="rounded bg-indigo-500/10 px-2 py-0.5 font-bold text-indigo-400 text-xs">
              1
            </span>
            Verify Scout evidence excerpts against the original raw report text.
          </li>
          <li className="flex items-start gap-3">
            <span className="rounded bg-indigo-500/10 px-2 py-0.5 font-bold text-indigo-400 text-xs">
              2
            </span>
            Check inventory shortfalls; unquantified demand must remain TBD, never zero.
          </li>
          <li className="flex items-start gap-3">
            <span className="rounded bg-rose-500/10 px-2 py-0.5 font-bold text-rose-400 text-xs">
              3
            </span>
            Use two-stage control: internally approve drafts before public broadcasting.
          </li>
        </ol>
      </section>
    </aside>
  );
}