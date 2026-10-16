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
import Header from '@/components/Header';
import CommandCenter from '@/components/CommandCenter';
import PublicPortal from '@/components/PublicPortal';

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

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-300 selection:bg-indigo-500/30">
      {/* Global Header */}
      <Header 
        activeView={activeView} 
        setActiveView={setActiveView} 
        publishedAlertsCount={publishedAlerts.length} 
      />

      {/* VIEW 1: COMMAND CENTER */}
      {activeView === 'command' && (
        <CommandCenter
          reportText={reportText}
          setReportText={setReportText}
          isProcessing={isProcessing}
          error={error}
          results={results}
          approvedDraftIds={approvedDraftIds}
          publishedAlerts={publishedAlerts}
          victimRequests={victimRequests}
          currentTimestamp={currentTimestamp}
          handleRunPipeline={handleRunPipeline}
          handleReset={handleReset}
          handleMarkRescueComplete={handleMarkRescueComplete}
          handleApproveDraft={handleApproveDraft}
          handlePublishToPublic={handlePublishToPublic}
          formatLabel={formatLabel}
        />
      )}

      {/* VIEW 2: PUBLIC SAFETY & RELIEF PORTAL */}
      {activeView === 'public' && (
        <PublicPortal
          victimName={victimName}
          setVictimName={setVictimName}
          victimNeed={victimNeed}
          setVictimNeed={setVictimNeed}
          victimSubmitted={victimSubmitted}
          setVictimSubmitted={setVictimSubmitted}
          rescueEta={rescueEta}
          locationLoading={locationLoading}
          locationError={locationError}
          publishedAlerts={publishedAlerts}
          handleVictimRescueSubmit={handleVictimRescueSubmit}
          formatLabel={formatLabel}
        />
      )}

      <footer className="border-t border-slate-800 px-4 py-6 text-center text-xs text-slate-500">
        SHIKHAR-AI · Enterprise Multi-Agent Disaster Response Decision Support System · Nepal
      </footer>
    </div>
  );
}