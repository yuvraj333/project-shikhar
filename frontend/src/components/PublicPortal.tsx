'use client';

import { 
  Globe, 
  HelpCircle, 
  CheckCircle2, 
  Send, 
  Loader2, 
  MessageSquare, 
  Calendar, 
  Package, 
  DollarSign, 
  Building2, 
  MapPin, 
  Navigation, 
  Clock 
} from 'lucide-react';

interface PublicPortalProps {
  victimName: string;
  setVictimName: (name: string) => void;
  victimNeed: string;
  setVictimNeed: (need: string) => void;
  victimSubmitted: boolean;
  setVictimSubmitted: (submitted: boolean) => void;
  rescueEta: string | null;
  locationLoading: boolean;
  locationError: string | null;
  publishedAlerts: any[];
  handleVictimRescueSubmit: (e: React.FormEvent) => void;
  formatLabel: (value: string | null | undefined) => string;
}

export default function PublicPortal({
  victimName,
  setVictimName,
  victimNeed,
  setVictimNeed,
  victimSubmitted,
  setVictimSubmitted,
  rescueEta,
  locationLoading,
  locationError,
  publishedAlerts,
  handleVictimRescueSubmit,
  formatLabel,
}: PublicPortalProps) {
  return (
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
                  {alert.language} — {formatLabel(alert.audience)}
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
  );
}