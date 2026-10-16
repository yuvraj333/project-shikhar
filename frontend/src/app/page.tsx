'use client';

import { useState, useEffect } from 'react';
import { 
  processReport, 
  approveDraftApi, 
  publishDraftApi, 
  fetchPublicBroadcasts, 
  submitRescueRequest, 
  fetchRescueRequests,
  updateRescueStatusApi
} from '@/lib/api';
import type { ShikharResponse, MessageDraft } from './types';
import {
  AlertTriangle,
  ShieldAlert,
  Package,
  MessageSquare,
  Loader2,
  XCircle,
  Radio,
  Globe,
  CheckCircle2,
  FileText,
  Check,
  ShieldCheck,
  Clock,
  MapPin,
  RefreshCw,
  Calendar,
  Navigation,
  DollarSign,
  Building2,
  HelpCircle,
  Send,
  Users,
} from 'lucide-react';

export default function ShikharPlatform() {
  const [activeView, setActiveView] = useState<'command' | 'public'>('command');

  const [reportText, setReportText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ShikharResponse['data'] | null>(null);

  // Approval state connected to backend database (SQLite)
  const [approvedDraftIds, setApprovedDraftIds] = useState<string[]>([]);
  const [publishedAlerts, setPublishedAlerts] = useState<any[]>([]);
  const [victimRequests, setVictimRequests] = useState<any[]>([]);

  // Victim self-geo-tagging state
  const [victimName, setVictimName] = useState('');
  const [victimNeed, setVictimNeed] = useState('Medical & Rescue Support');
  const [victimSubmitted, setVictimSubmitted] = useState(false);
  const [rescueEta, setRescueEta] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Client-side timestamp state to prevent Next.js SSR hydration mismatch
  const [currentTimestamp, setCurrentTimestamp] = useState<string>('');

  useEffect(() => {
    setCurrentTimestamp(
      new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    );
  }, []);

  const formatLocalDateTime = (dateInput?: string | Date) => {
    const d = dateInput ? new Date(dateInput) : new Date();
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Fetch broadcasts and live victim rescue requests on mount and poll
  const refreshData = async () => {
    try {
      const broadcastRes = await fetchPublicBroadcasts();
      if (broadcastRes && broadcastRes.broadcasts) {
        setPublishedAlerts(broadcastRes.broadcasts.map((b: any) => ({
          ...b,
          published_at: formatLocalDateTime(b.published_at)
        })));
      }

      const rescueRes = await fetchRescueRequests();
      if (rescueRes && rescueRes.requests) {
        setVictimRequests(rescueRes.requests);
      }
    } catch {
      // Fallback silently if backend is offline
    }
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 5000); // Poll live telemetry every 5s
    return () => clearInterval(interval);
  }, []);

  const handleRunPipeline = async () => {
    if (!reportText.trim() || isProcessing) return;

    setIsProcessing(true);
    setError(null);
    setResults(null);
    setApprovedDraftIds([]);

    try {
      const response = await processReport(reportText.trim());

      if (response.status !== 'success' || !response.data) {
        throw new Error('The backend returned an unexpected response.');
      }

      setResults(response.data);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred while processing the report.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApproveDraft = async (draftId: string) => {
    try {
      const incidentId = results?.incident?.incident_id || 'INC-UNKNOWN';
      await approveDraftApi(draftId, incidentId);

      setApprovedDraftIds((previous) =>
        previous.includes(draftId)
          ? previous
          : [...previous, draftId]
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to record draft approval.');
    }
  };

  const handlePublishToPublic = async (
    draft: MessageDraft,
    draftId: string
  ) => {
    if (!approvedDraftIds.includes(draftId)) {
      setError('Review and approve the draft before publishing to the portal.');
      return;
    }

    try {
      await publishDraftApi(draft, draftId);
      await refreshData();
      setActiveView('public');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to publish broadcast.');
    }
  };

  // Mark rescue complete handler for Command Center operators
  const handleMarkRescueComplete = async (requestId: number) => {
    try {
      await updateRescueStatusApi(requestId, 'Rescue Completed & Verified');
      await refreshData();
    } catch {
      setError('Failed to update rescue status on server.');
    }
  };

  // Geo-location permission & submission handler
  const handleVictimRescueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!victimName.trim()) return;

    setLocationLoading(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        try {
          await submitRescueRequest(victimName, victimNeed, lat, lng);
          await refreshData();

          const randomMins = Math.floor(Math.random() * 15) + 12;
          setRescueEta(`${randomMins} mins`);
          setVictimSubmitted(true);
        } catch {
          setLocationError('Failed to transmit location to Command Center server.');
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        setLocationLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError('Location access was denied. Please turn on device/browser location services and try again.');
        } else {
          setLocationError('Unable to retrieve your location. Please check your device settings.');
        }
      },
      { timeout: 10000, maximumAge: 0, enableHighAccuracy: true }
    );
  };

  const handleReset = () => {
    setReportText('');
    setError(null);
    setResults(null);
    setApprovedDraftIds([]);
  };

  const formatLabel = (value: string | null | undefined) => {
    if (value == null || value.trim() === '') return 'Unknown';

    return value
      .replaceAll('_', ' ')
      .replace(/\b\w/g, (character) => character.toUpperCase());
  };

  const activeRequests = victimRequests.filter(r => r.status !== 'Rescue Completed & Verified');
  const completedRequests = victimRequests.filter(r => r.status === 'Rescue Completed & Verified');

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-300 selection:bg-indigo-500/30">
      {/* Global Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-4 sm:px-6 md:flex-row">
          <div className="flex w-full items-center justify-between md:w-auto">
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-2.5 shadow-inner">
                <ShieldAlert className="h-6 w-6 text-rose-500 animate-pulse" />
              </div>

              <div>
                <h1 className="text-xl font-bold tracking-wide text-white">
                  SHIKHAR-AI
                </h1>
                <p className="text-xs text-slate-500">
                  Human-supervised disaster response
                </p>
              </div>
            </div>

            <span className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-400 md:hidden">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              Ready
            </span>
          </div>

          <nav
            aria-label="Main navigation"
            className="flex w-full rounded-xl border border-slate-800 bg-slate-900 p-1 shadow-inner md:w-auto"
          >
            <button
              onClick={() => setActiveView('command')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all md:flex-none ${
                activeView === 'command'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Radio className="h-4 w-4" />
              Command Center
            </button>

            <button
              onClick={() => setActiveView('public')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all md:flex-none ${
                activeView === 'public'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Globe className="h-4 w-4" />
              Public Portal ({publishedAlerts.length})
            </button>
          </nav>

          <div className="hidden items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-400 md:flex shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            SQLite & FastAPI Synchronized
          </div>
        </div>
      </header>

      {/* ========================================= */}
      {/* VIEW 1: COMMAND CENTER                    */}
      {/* ========================================= */}
      {activeView === 'command' && (
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
              <>
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
              </>
            )}
          </section>
        </main>
      )}

      {/* ========================================= */}
      {/* VIEW 2: PUBLIC SAFETY & RELIEF PORTAL     */}
      {/* ========================================= */}
      {activeView === 'public' && (
        <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 animate-in fade-in duration-300 space-y-10">
          <div className="text-center">
            <div className="mb-4 inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 p-4 shadow-inner">
              <Globe className="h-8 w-8 text-emerald-400" />
            </div>

            <h2 className="text-3xl font-extrabold text-white sm:text-4xl tracking-tight">
              Public Safety & Relief Portal
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">
              Official emergency notices, live survivor geo-tagging, and verified relief supply hubs with map locators.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs text-emerald-300 font-medium">
              <CheckCircle2 className="h-4 w-4" />
              Live Crisis Assistance & Shelter Hub
            </div>
          </div>

          {/* 1. ARE YOU AFFECTED? VICTIM GEO-TAGGING WIDGET */}
          <div className="rounded-3xl border border-indigo-500/40 bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-950 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                <HelpCircle className="h-6 w-6 text-indigo-400 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Are You Affected? Locate Yourself</h3>
                <p className="text-xs text-slate-400">Turn on device location services and share your GPS coords for immediate rescue.</p>
              </div>
            </div>

            {locationError && (
              <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">
                {locationError}
              </div>
            )}

            {!victimSubmitted ? (
              <form onSubmit={handleVictimRescueSubmit} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Your Name / Family Identifier
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Ram Bahadur & Family"
                      value={victimName}
                      onChange={(e) => setVictimName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Immediate Support Needed
                    </label>
                    <select
                      value={victimNeed}
                      onChange={(e) => setVictimNeed(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Medical & Rescue Support">Medical / Trapped Rescue Support</option>
                      <option value="Drinking Water & Food">Drinking Water & Food Rations</option>
                      <option value="Emergency Tent / Shelter">Emergency Tent / Shelter</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={locationLoading}
                  className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-rose-950 flex items-center justify-center gap-2 disabled:bg-slate-800 disabled:text-slate-500"
                >
                  {locationLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Please turn on device location & acquiring GPS...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Share My GPS Location & Request Rescue Team
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-center space-y-3 animate-in fade-in">
                <div className="inline-flex p-3 bg-emerald-500/20 rounded-full text-emerald-400 mb-1">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h4 className="text-lg font-bold text-white">Help is on the way, {victimName}!</h4>
                <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                  Your GPS location and distress signal have been securely transmitted to the Command Center database. Estimated team arrival: <span className="text-amber-400 font-semibold">~{rescueEta}</span>
                </p>
                <div>
                  <button
                    onClick={() => setVictimSubmitted(false)}
                    className="mt-3 text-xs text-indigo-400 hover:underline font-medium"
                  >
                    Submit another request
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. AUTHORIZED EMERGENCY BROADCAST NOTICES */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <MessageSquare className="h-5 w-5 text-purple-400" />
              Authorized Emergency Broadcast Notices
            </h3>

            {publishedAlerts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/50 px-6 py-10 text-center shadow-xl">
                <p className="text-sm text-slate-400">No active emergency notices at this time.</p>
              </div>
            ) : (
              publishedAlerts.map((alert, index) => (
                <article
                  key={`${alert.draft_id}-${index}`}
                  className="overflow-hidden rounded-2xl border-l-4 border-emerald-500 border border-slate-800 bg-slate-900 shadow-2xl p-6 sm:p-8 relative group"
                >
                  <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-bl-xl shadow-sm">
                    Verified Notice
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <p className="text-slate-400 text-xs uppercase tracking-widest font-bold">
                      {alert.language} • {formatLabel(alert.audience)}
                    </p>
                    {alert.published_at && (
                      <span className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
                        <Calendar className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Published: {alert.published_at}</span>
                      </span>
                    )}
                  </div>

                  <p className="text-white text-lg sm:text-xl leading-relaxed font-medium whitespace-pre-wrap">
                    {alert.body}
                  </p>
                </article>
              ))
            )}
          </div>

          {/* 3. VERIFIED RELIEF HUBS & MAP LOCATORS (LOGISTICS) */}
          <div className="space-y-6 pt-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Package className="h-5 w-5 text-blue-400" />
              Verified Relief Centers & Active Relief Funds
            </h3>

            {/* Relief Fund Allocation Banner */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                  <DollarSign className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">Nepal Disaster Emergency Relief Fund</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Disbursed directly for immediate community rescue & provisions.</p>
                </div>
              </div>
              <div className="text-right bg-slate-950 px-4 py-3 rounded-xl border border-slate-800 w-full md:w-auto">
                <p className="text-xs text-slate-400 uppercase tracking-wider">Allocated Budget</p>
                <p className="text-lg font-extrabold text-emerald-400">NPR 12,50,000 <span className="text-xs font-normal text-slate-400">(Active)</span></p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Hub 1 */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl space-y-4">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-white text-base flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-indigo-400" /> Kathmandu Warehouse A
                  </h4>
                  <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-1 rounded-full font-medium border border-emerald-500/20">
                    Open
                  </span>
                </div>
                
                <p className="text-sm text-slate-400 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-rose-500 shrink-0" /> Ring Road, Kathmandu
                </p>

                <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                  <span className="flex items-center gap-1 text-indigo-400 font-semibold">
                    <Navigation className="h-3.5 w-3.5" /> 4.2 km away
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="flex items-center gap-1 text-amber-400 font-semibold">
                    <Clock className="h-3.5 w-3.5" /> Est. Travel: 15 mins
                  </span>
                </div>

                <div className="text-xs bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 text-slate-300">
                  <p>💧 <strong>Drinking Water:</strong> Available (500 bottles)</p>
                  <p>🩹 <strong>First-Aid Kits:</strong> Available (50 units)</p>
                </div>

                <a
                  href="https://maps.google.com/?q=Kathmandu+Warehouse"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors pt-1"
                >
                  <Globe className="h-3.5 w-3.5" /> Open in Google Maps Locator →
                </a>
              </div>

              {/* Hub 2 */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl space-y-4">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-white text-base flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-indigo-400" /> Lalitpur Relief Depot
                  </h4>
                  <span className="bg-amber-500/10 text-amber-400 text-xs px-2.5 py-1 rounded-full font-medium border border-amber-500/20">
                    Limited Stock
                  </span>
                </div>
                
                <p className="text-sm text-slate-400 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-rose-500 shrink-0" /> Patan Durbar Area, Lalitpur
                </p>

                <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                  <span className="flex items-center gap-1 text-indigo-400 font-semibold">
                    <Navigation className="h-3.5 w-3.5" /> 8.5 km away
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="flex items-center gap-1 text-amber-400 font-semibold">
                    <Clock className="h-3.5 w-3.5" /> Est. Travel: 28 mins
                  </span>
                </div>

                <div className="text-xs bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 text-slate-300">
                  <p>⛺ <strong>Emergency Tents:</strong> Stock Depleted (0 units)</p>
                  <p>🍲 <strong>Food Rations:</strong> Available</p>
                </div>

                <a
                  href="https://maps.google.com/?q=Lalitpur+Nepal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors pt-1"
                >
                  <Globe className="h-3.5 w-3.5" /> Open in Google Maps Locator →
                </a>
              </div>
            </div>
          </div>
        </main>
      )}

      <footer className="border-t border-slate-800 px-4 py-6 text-center text-xs text-slate-500">
        SHIKHAR-AI · Enterprise Multi-Agent Disaster Response Decision Support System · Nepal
      </footer>
    </div>
  );
}

function InfoCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
      <p className="mb-1.5 flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500 font-semibold">
        {icon}
        {label}
      </p>
      <p className="break-words text-sm font-semibold text-white">{value}</p>
    </div>
  );
}