'use client';

import { ShieldAlert, Radio, Globe } from 'lucide-react';

interface HeaderProps {
  activeView: 'command' | 'public';
  setActiveView: (view: 'command' | 'public') => void;
  publishedCount: number;
}

export function Header({ activeView, setActiveView, publishedCount }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-4 sm:px-6 md:flex-row">
        <div className="flex w-full items-center justify-between md:w-auto">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-2.5 shadow-inner">
              <ShieldAlert className="h-6 w-6 text-rose-500 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-wide bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                SHIKHAR-AI
              </h1>
              <p className="text-xs text-slate-500">
                Multi-Agent Disaster Decision Support
              </p>
            </div>
          </div>

          <span className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-400 md:hidden">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
            Online
          </span>
        </div>

        <nav
          aria-label="Main navigation"
          className="flex w-full rounded-xl border border-slate-800 bg-slate-900 p-1 shadow-inner md:w-auto"
        >
          <button
            onClick={() => setActiveView('command')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all md:flex-none ${
              activeView === 'command'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Radio className="h-4 w-4" />
            Command Center
          </button>

          <button
            onClick={() => setActiveView('public')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all md:flex-none ${
              activeView === 'public'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Globe className="h-4 w-4" />
            Public Portal ({publishedCount})
          </button>
        </nav>

        <div className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1.5 text-xs text-emerald-400 shadow-sm md:flex">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          Backend Synchronized
        </div>
      </div>
    </header>
  );
}