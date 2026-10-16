'use client';

import {
  ShieldAlert,
  Package,
  MessageSquare,
  Loader2,
  Clock,
  MapPin,
  FileText,
  AlertTriangle,
  Check,
  Globe,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import type { ShikharResponse, MessageDraft } from '@/app/types';

interface AgentResultsProps {
  isProcessing: boolean;
  results: ShikharResponse['data'] | null;
  hasError: boolean;
  approvedDraftIds: string[];
  publishedAlerts: MessageDraft[];
  onApproveDraft: (draftId: string) => void;
  onPublishToPublic: (draft: MessageDraft, draftId: string) => void;
  formatLabel: (value: string | null | undefined) => string;
}

export function AgentResults({
  isProcessing,
  results,
  hasError,
  approvedDraftIds,
  publishedAlerts,
  onApproveDraft,
  onPublishToPublic,
  formatLabel,
}: AgentResultsProps) {
  if (isProcessing) {
    return (
      <div
        role="status"
        className="flex min-h-[480px] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-8 text-center"
      >
        <Loader2 className="h-10 w-10 animate-spin text-indigo-400" />
        <h2 className="text-lg font-semibold text-white">
          Executing Multi-Agent Pipeline...
        </h2>
        <p className="max-w-md text-sm text-slate-400 leading-relaxed">
          Scout Agent is extracting evidence, Logistics is calculating deterministic inventory shortfalls, and Comms is drafting guarded alerts.
        </p>
      </div>
    );
  }

  if (!results && !hasError) {
    return (
      <div className="flex min-h-[480px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/20 p-8 text-center">
        <div className="mb-4 rounded-full border border-indigo-500/20 bg-indigo-500/10 p-5 shadow-inner">
          <ShieldAlert className="h-10 w-10 text-indigo-400" />
        </div>
        <h2 className="text-xl font-bold text-white">
          Incident Command Dashboard
        </h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-400">
          Submit an incoming field report on the left panel to initialize agent analysis and review safety recommendations.
        </p>
      </div>
    );
  }

  if (!results) return null;

  return (
    <section className="space-y-6 xl:col-span-8">
      {/* Workflow Status Banner */}
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 shadow-lg flex items-start gap-4">
        <Clock className="h-6 w-6 shrink-0 text-amber-400 mt-0.5" />
        <div>
          <p className="font-bold text-amber-300 text-base">
            Human Review Required
          </p>
          <p className="mt-1 text-sm text-slate-300 leading-relaxed">
            Workflow Status: <span className="font-semibold text-white">{formatLabel(results.workflow_status)}</span>. All automated recommendations require operator verification before operational action.
          </p>
        </div>
      </div>

      {/* 1. SCOUT AGENT */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-2xl">
        <div className="border-b border-slate-800 bg-slate-800/40 px-6 py-4 flex flex-wrap gap-3 justify-between items-center">
          <h2 className="flex items-center gap-2.5 font-bold text-white">
            <ShieldAlert className="h-5 w-5 text-rose-500" />
            1. Scout Agent: Incident Validation & Evidence
          </h2>
          <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider ${results.incident.verification_status === 'unverified' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
            {formatLabel(results.incident.verification_status)}
          </span>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoCard label="Disaster Type" value={formatLabel(results.incident.disaster_type)} />
            <InfoCard label="Severity" value={formatLabel(results.incident.severity)} />
            <InfoCard label="Location" value={results.incident.location_text || 'Unknown'} icon={<MapPin className="h-4 w-4 text-slate-500" />} />
            <InfoCard label="People Trapped / Injured" value={`${results.incident.people_trapped ?? 'Unknown'} Trapped • ${results.incident.people_injured ?? 'Unknown'} Injured`} />
          </div>

          {results.incident.evidence?.length > 0 && (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
              <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
                <FileText className="h-4 w-4" /> Grounding Evidence & Citations
              </h3>
              <div className="space-y-3">
                {results.incident.evidence.map((item, index) => (
                  <article key={index} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                    <p className="text-sm leading-relaxed text-slate-200 italic">
                      &ldquo;{item.source_excerpt}&rdquo;
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <span className="rounded bg-slate-800 px-2.5 py-1 text-slate-300 font-medium">
                        Field: {formatLabel(item.field)}
                      </span>
                      <span className="rounded bg-amber-500/10 px-2.5 py-1 text-amber-400 font-medium uppercase">
                        {formatLabel(item.confidence)}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. LOGISTICS AGENT */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-2xl">
        <div className="border-b border-slate-800 bg-slate-800/40 px-6 py-4 flex flex-wrap gap-3 justify-between items-center">
          <h2 className="flex items-center gap-2.5 font-bold text-white">
            <Package className="h-5 w-5 text-blue-400" />
            2. Logistics Agent: Resource Plan
          </h2>
          <span className="text-xs px-3 py-1 rounded-full font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            HUMAN VERIFICATION REQUIRED
          </span>
        </div>

        <div className="p-6">
          <p className="mb-4 text-xs font-mono text-slate-500">
            Snapshot ID: {results.response_plan.inventory_snapshot_id}
          </p>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[540px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-3 pb-3">Resource</th>
                  <th className="px-3 pb-3">Available</th>
                  <th className="px-3 pb-3">Proposed Demand</th>
                  <th className="px-3 pb-3">Shortfall</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {results.response_plan.recommendations.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-3 py-4 font-semibold text-white capitalize">
                      {formatLabel(item.resource_type)}
                    </td>
                    <td className="px-3 py-4 text-emerald-400 font-medium">
                      {item.available_quantity ?? 'Unknown'} {item.unit}
                    </td>
                    <td className="px-3 py-4 text-blue-400 font-medium">
                      {item.proposed_quantity ?? 'TBD'} {item.proposed_quantity !== null ? item.unit : ''}
                    </td>
                    <td className="px-3 py-4 text-amber-400 font-medium">
                      {item.shortfall_quantity ?? 'TBD (Unquantified)'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 3. COMMUNICATIONS AGENT */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-2xl">
        <div className="border-b border-slate-800 bg-slate-800/40 px-6 py-4">
          <h2 className="flex items-center gap-2.5 font-bold text-white">
            <MessageSquare className="h-5 w-5 text-purple-400" />
            3. Communications Agent: Two-Stage Review & Broadcast
          </h2>
        </div>

        <div className="p-6 space-y-5">
          {results.communications.drafts.map((draft, index) => {
            const draftId = draft.draft_id || `DRAFT-${index}`;
            const isApproved = approvedDraftIds.includes(draftId);
            const isInPortal = publishedAlerts.some((item) => item.draft_id === draft.draft_id);

            return (
              <article key={draftId} className="rounded-2xl border border-slate-800 bg-slate-950 p-5 sm:p-6 shadow-inner space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <span className="text-xs text-purple-300 uppercase tracking-widest font-bold bg-purple-400/10 px-3 py-1.5 rounded-lg border border-purple-400/20 w-fit">
                    {draft.language} • {formatLabel(draft.audience)}
                  </span>

                  {/* Two-Stage Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    {!isApproved ? (
                      <button
                        onClick={() => onApproveDraft(draftId)}
                        className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-md flex items-center gap-1.5"
                      >
                        <Check className="h-3.5 w-3.5" /> Step 1: Approve Draft
                      </button>
                    ) : (
                      <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-2 rounded-xl font-medium flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4" /> Approved Internally
                      </span>
                    )}

                    <button
                      onClick={() => onPublishToPublic(draft, draftId)}
                      disabled={!isApproved || isInPortal}
                      className={`text-xs px-4 py-2.5 rounded-xl font-medium transition-all flex items-center gap-1.5 shadow ${
                        isApproved && !isInPortal
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <Globe className="h-3.5 w-3.5" />
                      {isInPortal ? 'Published to Portal' : 'Step 2: Publish to Portal'}
                    </button>
                  </div>
                </div>

                <p className="text-slate-200 text-base leading-relaxed whitespace-pre-wrap">
                  {draft.body}
                </p>

                {draft.warnings?.length > 0 && (
                  <div className="text-xs text-amber-400 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                    <strong className="font-bold">Grounding Warning:</strong> {draft.warnings[0]}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>

      {/* Safety State Summary */}
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 shadow-xl">
        <h2 className="mb-4 flex items-center gap-2 font-bold text-emerald-300">
          <ShieldCheck className="h-5 w-5" />
          System Safety State
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SafetyCard label="Incident Verified" value={results.safety.incident_verified ? 'Verified' : 'Unverified'} safe={!results.safety.incident_verified} />
          <SafetyCard label="Dispatch Status" value={formatLabel(results.safety.dispatch_status)} safe={results.safety.dispatch_status === 'not_dispatched'} />
          <SafetyCard label="Message Delivery" value={formatLabel(results.safety.communication_delivery_status)} safe={results.safety.communication_delivery_status === 'not_sent'} />
          <SafetyCard label="Human Approval" value={results.safety.requires_human_approval ? 'Mandatory' : 'Bypassed'} safe={results.safety.requires_human_approval} />
        </div>
      </div>
    </section>
  );
}

function InfoCard({ label, value, icon }: { label: string; value: string | number; icon?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
      <p className="mb-1.5 flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500 font-semibold">
        {icon}
        {label}
      </p>
      <p className="text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function SafetyCard({ label, value, safe }: { label: string; value: string; safe: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-4">
      <span className="text-sm text-slate-400">{label}</span>
      <span className={`text-sm font-bold flex items-center gap-1.5 ${safe ? 'text-emerald-400' : 'text-amber-400'}`}>
        {safe ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
        {value}
      </span>
    </div>
  );
}