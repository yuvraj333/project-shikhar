'use client';

import { ShieldAlert, Radio, Globe } from 'lucide-react';

interface HeaderProps {
  activeView: 'command' | 'public';
  setActiveView: (view: 'command' | 'public') => void;
  publishedAlertsCount: number;
}

export default function Header({ activeView, setActiveView, publishedAlertsCount }: HeaderProps) {
  return (
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
            Public Portal ({publishedAlertsCount})
          </button>
        </nav>

        <div className="hidden items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-400 md:flex shadow-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          SQLite & FastAPI Synchronized
        </div>
      </div>
    </header>
  );
}