'use client';

import { 
  ShieldAlert, 
  Package, 
  MessageSquare, 
  Clock, 
  Calendar, 
  MapPin, 
  FileText, 
  Check, 
  CheckCircle2, 
  Globe 
} from 'lucide-react';
import InfoCard from './InfoCard';
import type { ShikharResponse, MessageDraft } from '@/app/types';

interface AgentResultProps {
  results: ShikharResponse['data'];
  currentTimestamp: string;
  approvedDraftIds: string[];
  publishedAlerts: any[];
  handleApproveDraft: (draftId: string) => void;
  handlePublishToPublic: (draft: MessageDraft, draftId: string) => void;
  formatLabel: (value: string | null | undefined) => string;
}

export default function AgentResult({
  results,
  currentTimestamp,
  approvedDraftIds,
  publishedAlerts,
  handleApproveDraft,
  handlePublishToPublic,
  formatLabel,
}: AgentResultProps) {
  return (
    <div className="space-y-6">
      {/* Workflow status & Timestamp Header */}
      <section className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-start gap-4">
          <Clock className="mt-0.5 h-6 w-6 shrink-0 text-amber-400" />
          <div>
            <p className="font-bold text-amber-300 text-base">
              Human review required
            </p>
            <p className="mt-1 text-sm text-slate-300 leading-relaxed">
              Workflow status:{' '}
              <span className="font-semibold text-white">
                {formatLabel(results.workflow_status)}
              </span>
              . This result does not establish that the incident is verified.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl shrink-0">
          <Calendar className="h-3.5 w-3.5 text-indigo-400" />
          <span>Analyzed: {currentTimestamp}</span>
        </div>
      </section>

      {/* 1. Scout */}
      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-800/40 px-6 py-4">
          <h2 className="flex items-center gap-2.5 font-bold text-white">
            <ShieldAlert className="h-5 w-5 text-rose-400" />
            1. Scout — Incident Analysis & Evidence
          </h2>

          <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-300">
            {formatLabel(results.incident.verification_status)}
          </span>
        </div>

        <div className="space-y-5 p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoCard
              label="Disaster type"
              value={formatLabel(results.incident.disaster_type)}
            />
            <InfoCard
              label="Severity"
              value={formatLabel(results.incident.severity)}
            />
            <InfoCard
              label="Location"
              value={results.incident.location_text || 'Unknown'}
              icon={<MapPin className="h-4 w-4 text-slate-500" />}
            />
            <InfoCard
              label="People trapped"
              value={results.incident.people_trapped ?? 'Unknown'}
            />
            <InfoCard
              label="People injured"
              value={results.incident.people_injured ?? 'Unknown'}
            />
            <InfoCard
              label="Incident ID"
              value={results.incident.incident_id}
            />
          </div>

          {results.incident.evidence?.length > 0 && (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
              <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
                <FileText className="h-4 w-4" />
                Report Evidence & Citations
              </h3>

              <div className="space-y-3">
                {results.incident.evidence.map((item, index) => (
                  <article
                    key={index}
                    className="rounded-xl border border-slate-800 bg-slate-900 p-4"
                  >
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
      </section>

      {/* 2. Logistics */}
      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-800/40 px-6 py-4">
          <h2 className="flex items-center gap-2.5 font-bold text-white">
            <Package className="h-5 w-5 text-blue-400" />
            2. Logistics — Resource Plan
          </h2>
          <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
            {formatLabel(results.response_plan.plan_status)}
          </span>
        </div>

        <div className="p-6">
          <p className="mb-4 text-xs font-mono text-slate-500">
            Inventory snapshot:{' '}
            <span className="text-slate-300">
              {results.response_plan.inventory_snapshot_id}
            </span>
          </p>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[570px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-3 pb-3">Resource</th>
                  <th className="px-3 pb-3">Available</th>
                  <th className="px-3 pb-3">Demand</th>
                  <th className="px-3 pb-3">Shortfall</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {results.response_plan.recommendations.map(
                  (item, index) => (
                    <tr
                      key={`${item.resource_type}-${index}`}
                      className="align-top hover:bg-slate-800/20 transition-colors"
                    >
                      <td className="px-3 py-4 font-semibold text-white capitalize">
                        {formatLabel(item.resource_type)}
                        <p className="mt-1 text-xs text-slate-500">
                          {item.validation_status
                            ? formatLabel(item.validation_status)
                            : 'Validation pending'}
                        </p>
                      </td>
                      <td className="px-3 py-4 text-emerald-400 font-medium">
                        {item.available_quantity ?? 'Unknown'}{' '}
                        {item.unit}
                      </td>
                      <td className="px-3 py-4 text-blue-400 font-medium">
                        {item.proposed_quantity ?? 'TBD'}{' '}
                        {item.proposed_quantity !== null
                          ? item.unit
                          : ''}
                      </td>
                      <td className="px-3 py-4 text-amber-400 font-medium">
                        {item.shortfall_quantity ?? 'TBD (Unquantified)'}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          {results.response_plan.recommendations.some(
            (item) => item.planning_assumptions.length > 0
          ) && (
            <div className="mt-6 space-y-3">
              <h3 className="text-sm font-semibold text-slate-300">
                Planning assumptions
              </h3>
              {results.response_plan.recommendations.map((item) =>
                item.planning_assumptions.map((assumption, index) => (
                  <p
                    key={`${item.resource_type}-${index}`}
                    className="border-l-2 border-blue-500/50 pl-3 text-sm leading-relaxed text-slate-400"
                  >
                    <span className="text-slate-200 font-medium">
                      {formatLabel(item.resource_type)}:
                    </span>{' '}
                    {assumption}
                  </p>
                ))
              )}
            </div>
          )}

          <div className="mt-6 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-sm text-rose-300 font-medium">
            Dispatch status:{' '}
            {formatLabel(results.response_plan.dispatch_status)}.
            No resources have been dispatched.
          </div>
        </div>
      </section>

      {/* 3. Communications */}
      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
        <div className="border-b border-slate-800 bg-slate-800/40 px-6 py-4">
          <h2 className="flex items-center gap-2.5 font-bold text-white">
            <MessageSquare className="h-5 w-5 text-purple-400" />
            3. Communications — Two-Stage Review & Broadcast
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Drafts are stored securely. Use the two-stage controls below to review and authorize broadcasts.
          </p>
        </div>

        <div className="space-y-5 p-6">
          {results.communications.drafts.map((draft, index) => {
            const draftId = draft.draft_id || `DRAFT-${index}`;
            const isApproved = approvedDraftIds.includes(draftId);
            const isInPortal = publishedAlerts.some(
              (item) => item.body === draft.body
            );

            return (
              <article
                key={draftId}
                className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950 p-5 sm:p-6 shadow-inner"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-lg border border-purple-400/20 bg-purple-400/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-purple-300">
                      {draft.language}
                    </span>
                    <span className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 font-medium">
                      {formatLabel(draft.audience)}
                    </span>
                    <span className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-300 font-medium">
                      {formatLabel(draft.status)}
                    </span>
                  </div>

                  {/* Two-Stage Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    {!isApproved ? (
                      <button
                        onClick={() => handleApproveDraft(draftId)}
                        className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-semibold transition-all shadow-md flex items-center gap-1.5"
                      >
                        <Check className="h-3.5 w-3.5" /> Step 1: Approve Draft
                      </button>
                    ) : (
                      <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-2 rounded-xl font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4" /> Approved Internally
                      </span>
                    )}

                    <button
                      onClick={() => handlePublishToPublic(draft, draftId)}
                      disabled={!isApproved || isInPortal}
                      className={`text-xs px-4 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 shadow ${
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

                <div>
                  <p className="mb-2 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                    {formatLabel(draft.message_type)}
                  </p>
                  <p className="whitespace-pre-wrap text-base leading-relaxed text-slate-100 font-medium">
                    {draft.body}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}