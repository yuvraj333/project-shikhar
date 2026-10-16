'use client';

import { Globe, CheckCircle2, MessageSquare, AlertTriangle } from 'lucide-react';
import type { MessageDraft } from '@/app/types';

interface PublicPortalProps {
  publishedAlerts: MessageDraft[];
  onSwitchToCommand: () => void;
  formatLabel: (value: string | null | undefined) => string;
}

export function PublicPortal({ publishedAlerts, onSwitchToCommand, formatLabel }: PublicPortalProps) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 animate-in fade-in duration-300">
      <div className="mb-12 text-center">
        <div className="mb-4 inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 p-4 shadow-inner">
          <Globe className="h-8 w-8 text-emerald-400" />
        </div>

        <h2 className="text-3xl font-extrabold text-white sm:text-4xl tracking-tight">
          Public Safety Portal
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">
          Official authorized broadcasts published directly from the Command Center after operator verification.
        </p>

        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs text-emerald-300 font-medium">
          <CheckCircle2 className="h-4 w-4" />
          Verified Emergency Broadcast Feed
        </div>
      </div>

      {publishedAlerts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/50 px-6 py-20 text-center shadow-xl">
          <MessageSquare className="mx-auto mb-4 h-12 w-12 text-slate-600" />
          <p className="text-lg font-semibold text-slate-300">
            No active emergency broadcasts at this time.
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Awaiting authorized operator publication from the Command Center.
          </p>
          <button
            onClick={onSwitchToCommand}
            className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-900/30"
          >
            Return to Command Center
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {publishedAlerts.map((alert, index) => (
            <article
              key={`${alert.draft_id}-${index}`}
              className="overflow-hidden rounded-2xl border-l-4 border-emerald-500 border border-slate-800 bg-slate-900 shadow-2xl p-6 sm:p-8 relative group"
            >
              <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-bl-xl shadow-sm">
                Verified Broadcast
              </div>
              <p className="text-slate-400 text-xs uppercase tracking-widest font-bold mb-3">
                {alert.language} • {formatLabel(alert.audience)}
              </p>
              <p className="text-white text-lg sm:text-xl leading-relaxed font-medium whitespace-pre-wrap">
                {alert.body}
              </p>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}