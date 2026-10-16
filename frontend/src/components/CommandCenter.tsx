'use client';

import { 
  AlertTriangle, 
  Radio, 
  Loader2, 
  RefreshCw, 
  Users, 
  MapPin, 
  ShieldCheck, 
  XCircle 
} from 'lucide-react';
import AgentResult from './AgentResults';
import type { ShikharResponse, MessageDraft } from '@/app/types';

interface CommandCenterProps {
  reportText: string;
  setReportText: (text: string) => void;
  isProcessing: boolean;
  error: string | null;
  results: ShikharResponse['data'] | null;
  approvedDraftIds: string[];
  publishedAlerts: any[];
  victimRequests: any[];
  currentTimestamp: string;
  handleRunPipeline: () => void;
  handleReset: () => void;
  handleMarkRescueComplete: (requestId: number) => void;
  handleApproveDraft: (draftId: string) => void;
  handlePublishToPublic: (draft: MessageDraft, draftId: string) => void;
  formatLabel: (value: string | null | undefined) => string;
}

export default function CommandCenter({
  reportText,
  setReportText,
  isProcessing,
  error,
  results,
  approvedDraftIds,
  publishedAlerts,
  victimRequests,
  currentTimestamp,
  handleRunPipeline,
  handleReset,
  handleMarkRescueComplete,
  handleApproveDraft,
  handlePublishToPublic,
  formatLabel,
}: CommandCenterProps) {
  const activeRequests = victimRequests.filter(r => r.status !== 'Rescue Completed & Verified');
  const completedRequests = victimRequests.filter(r => r.status === 'Rescue Completed & Verified');

  return (
    <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 xl:grid-cols-12 animate-in fade-in duration-300">
      {/* Report Input & Live Telemetry Sidebar */}
      <aside className="space-y-6 xl:col-span-4">
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-2xl sm:p-6">
          <h2 className="mb-2 flex items-center gap-2 text-lg font-bold text-white">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            Incoming Field Report
          </h2>

          <p className="mb-5 text-sm leading-relaxed text-slate-400">
            Submit a report for AI-assisted incident analysis, inventory
            planning, and draft communication. All outputs require human
            review.
          </p>

          <label
            htmlFor="incident-report"
            className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400"
          >
            Incident description
          </label>

          <textarea
            id="incident-report"
            className="h-36 w-full resize-y rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm leading-relaxed text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-inner"
            placeholder="e.g., A severe landslide has struck Nakkhu in Lalitpur district..."
            value={reportText}
            onChange={(event) => setReportText(event.target.value)}
            disabled={isProcessing}
          />

          <button
            onClick={handleRunPipeline}
            disabled={isProcessing || !reportText.trim()}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 font-semibold text-white transition-all hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500 shadow-lg shadow-indigo-950"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Analyzing Report...
              </>
            ) : (
              <>
                <Radio className="h-4 w-4" />
                Process Incident
              </>
            )}
          </button>

          {results && !isProcessing && (
            <button
              onClick={handleReset}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Start New Report
            </button>
          )}
        </section>

        {/* LIVE COMMAND CENTER TELEMETRY & RESCUE COMPLETE TRACKER */}
        <section className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-bold text-rose-300 uppercase tracking-wider">
              <Users className="h-4 w-4 animate-pulse" /> Live Telemetry Feed
            </h3>
            <span className="bg-rose-500/20 text-rose-400 text-xs px-2.5 py-0.5 rounded-full font-bold">
              {activeRequests.length} Active
            </span>
          </div>

          {activeRequests.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No active distress signals.</p>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {activeRequests.map((req) => (
                <div key={req.id} className="p-3.5 rounded-xl border border-rose-500/30 bg-slate-950 space-y-2 text-xs shadow-md">
                  <div className="flex justify-between items-center font-semibold text-white">
                    <span className="text-sm">{req.name}</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] uppercase font-bold bg-rose-500/10 text-rose-400">
                      {req.need}
                    </span>
                  </div>
                  <p className="text-slate-400 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" /> GPS: {req.latitude.toFixed(4)}, {req.longitude.toFixed(4)}
                  </p>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-800">
                    <a
                      href={`https://maps.google.com/?q=${req.latitude},${req.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:underline font-semibold"
                    >
                      Open Map Locator →
                    </a>
                    <button
                      onClick={() => handleMarkRescueComplete(req.id)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold shadow transition-all"
                    >
                      Mark Rescue Complete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {completedRequests.length > 0 && (
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <p className="text-[11px] uppercase font-bold text-emerald-400 tracking-wider">
                Resolved Rescues ({completedRequests.length})
              </p>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {completedRequests.map((req) => (
                  <div key={req.id} className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/50 space-y-1 text-xs opacity-70">
                    <div className="flex justify-between font-semibold text-slate-300">
                      <span>{req.name}</span>
                      <span className="text-emerald-400 text-[10px]">Resolved</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* OPERATOR SAFETY CHECKLIST */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6 shadow-xl">
          <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Operator Safety Checklist
          </h3>

          <ol className="space-y-3.5 text-sm leading-relaxed text-slate-400">
            <li className="flex items-start gap-3">
              <span className="rounded bg-indigo-500/10 px-2 py-0.5 font-bold text-indigo-400 text-xs">
                1
              </span>
              Verify evidence excerpts against the original report.
            </li>
            <li className="flex items-start gap-3">
              <span className="rounded bg-indigo-500/10 px-2 py-0.5 font-bold text-indigo-400 text-xs">
                2
              </span>
              Confirm resource availability and clarify unknown demand.
            </li>
            <li className="flex items-start gap-3">
              <span className="rounded bg-amber-500/10 px-2 py-0.5 font-bold text-amber-400 text-xs">
                3
              </span>
              Require authorized human review before operational action.
            </li>
            <li className="flex items-start gap-3">
              <span className="rounded bg-rose-500/10 px-2 py-0.5 font-bold text-rose-400 text-xs">
                4
              </span>
              Never treat an unverified draft as an official broadcast.
            </li>
          </ol>
        </section>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300 shadow-lg"
          >
            <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Request failed</p>
              <p className="mt-1 break-words leading-relaxed">{error}</p>
            </div>
          </div>
        )}
      </aside>

      {/* Agent Results */}
      <section className="space-y-6 xl:col-span-8">
        {isProcessing && (
          <div
            role="status"
            className="flex min-h-[360px] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-8 text-center"
          >
            <Loader2 className="h-10 w-10 animate-spin text-indigo-400" />
            <h2 className="font-bold text-white text-lg">
              Processing Incident
            </h2>
            <p className="max-w-md text-sm text-slate-400 leading-relaxed">
              Running the Scout, Logistics, and Communications workflow.
              Outputs are decision-support suggestions, not verified emergency info.
            </p>
          </div>
        )}

        {!isProcessing && !results && !error && (
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-8 text-center shadow-lg">
            <div className="mb-4 rounded-full border border-indigo-500/20 bg-indigo-500/10 p-5 shadow-inner">
              <Radio className="h-8 w-8 text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-white">
              Incident Command Dashboard
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-400">
              Submit a field report on the left panel to view incident extraction, resource recommendations, evidence, and draft communications.
            </p>
          </div>
        )}

        {results && !isProcessing && (
          <AgentResult
            results={results}
            currentTimestamp={currentTimestamp}
            approvedDraftIds={approvedDraftIds}
            publishedAlerts={publishedAlerts}
            handleApproveDraft={handleApproveDraft}
            handlePublishToPublic={handlePublishToPublic}
            formatLabel={formatLabel}
          />
        )}
      </section>
    </main>
  );
}