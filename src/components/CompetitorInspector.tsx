import React, { useState } from "react";
import { TrackedApp, CompetitorApp } from "../types";
import {
  Users,
  Plus,
  Trash2,
  Sparkles,
  Star,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  TrendingUp,
  Search,
  ShieldAlert,
} from "lucide-react";

interface CompetitorInspectorProps {
  app: TrackedApp;
  onAddCompetitor: (competitor: CompetitorApp) => void;
  onDeleteCompetitor: (id: string) => void;
  countryName: string;
}

export const CompetitorInspector: React.FC<CompetitorInspectorProps> = ({
  app,
  onAddCompetitor,
  onDeleteCompetitor,
  countryName,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [auditing, setAuditing] = useState(false);
  const [auditReport, setAuditReport] = useState<any | null>(null);

  const handleSearchAppStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const response = await fetch(
        `/api/appstore/search?term=${encodeURIComponent(searchQuery)}&country=${app.country}&limit=6`
      );
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results || []);
      }
    } catch (err) {
      console.error("App Store Search error:", err);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectSearchResult = (item: any) => {
    const comp: CompetitorApp = {
      id: `comp-${item.trackId}`,
      trackId: item.trackId,
      name: item.trackName,
      developer: item.artistName,
      iconUrl: item.artworkUrl512 || item.artworkUrl100,
      averageUserRating: item.averageUserRating || 4.5,
      userRatingCount: item.userRatingCount || 1000,
      title: item.trackName,
      subtitle: item.genres?.[0] ? `${item.genres[0]} App` : "iOS Application",
      category: item.primaryGenreName || item.genres?.[0] || "Productivity",
      topKeywords: [
        { keyword: item.trackName.toLowerCase().split(" ")[0] || "app", rank: 1 },
        { keyword: item.primaryGenreName?.toLowerCase() || "productivity", rank: 3 },
      ],
    };

    onAddCompetitor(comp);
    setShowAddModal(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleRunAiAudit = async (competitor: CompetitorApp) => {
    setAuditing(true);
    try {
      const response = await fetch("/api/gemini/competitor-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          myApp: {
            name: app.name,
            title: app.metadata.title,
            subtitle: app.metadata.subtitle,
            keywordField: app.metadata.keywordField,
            rating: app.averageUserRating,
            reviewsCount: app.userRatingCount,
          },
          competitorApp: {
            name: competitor.name,
            title: competitor.title,
            subtitle: competitor.subtitle,
            rating: competitor.averageUserRating,
            reviewsCount: competitor.userRatingCount,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAuditReport(data);
      }
    } catch (err) {
      console.error("Audit error:", err);
    } finally {
      setAuditing(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-950/40 via-zinc-900 to-indigo-950/40 border border-zinc-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-purple-400 font-semibold text-xs mb-1">
              <Users className="w-4 h-4 text-purple-400" />
              <span>Competitor Intelligence & ASO Metadata Benchmark</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Competitor Metadata & Keyword Gap
            </h1>
            <p className="text-xs text-zinc-400 mt-1 max-w-xl">
              Compare your app's Title, Subtitle, Ratings, and Keyword density side-by-side with top competitors in <strong className="text-zinc-200">{countryName}</strong>.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="shrink-0 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center space-x-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Competitor from App Store</span>
          </button>
        </div>
      </div>

      {/* Side-by-Side Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Your App Card */}
        <div className="bg-zinc-900 border-2 border-indigo-500/50 rounded-2xl p-5 space-y-4 shadow-xl relative">
          <div className="absolute top-3 right-3 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Your App
          </div>

          <div className="flex items-center space-x-3 pr-16">
            <img
              src={app.iconUrl}
              alt={app.name}
              className="w-12 h-12 rounded-xl object-cover border border-zinc-700"
            />
            <div className="min-w-0">
              <h3 className="font-bold text-white text-sm truncate">{app.name}</h3>
              <p className="text-[11px] text-zinc-400 truncate">{app.developer}</p>
            </div>
          </div>

          <div className="space-y-2 text-xs bg-zinc-950 p-3 rounded-xl border border-zinc-800">
            <div>
              <span className="text-[10px] text-zinc-400 uppercase font-semibold">Title (30c limit):</span>
              <p className="font-mono text-zinc-200 mt-0.5">{app.metadata.title || "N/A"}</p>
              <span className="text-[10px] text-zinc-400">
                Length: {app.metadata.title.length}/30 chars
              </span>
            </div>

            <div className="pt-1 border-t border-zinc-800">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold">Subtitle (30c limit):</span>
              <p className="font-mono text-zinc-200 mt-0.5">{app.metadata.subtitle || "N/A"}</p>
              <span className="text-[10px] text-zinc-400">
                Length: {app.metadata.subtitle.length}/30 chars
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs bg-zinc-950 p-3 rounded-xl border border-zinc-800">
            <div className="flex items-center space-x-1 text-amber-400">
              <Star className="w-4 h-4 fill-amber-400" />
              <span className="font-bold text-sm">{app.averageUserRating}</span>
              <span className="text-zinc-400 text-[11px]">/ 5.0</span>
            </div>
            <span className="text-zinc-400 font-mono text-xs">
              {app.userRatingCount.toLocaleString()} Reviews
            </span>
          </div>
        </div>

        {/* Competitor Cards */}
        {app.competitors.map((comp) => (
          <div
            key={comp.id}
            className="bg-zinc-900/80 border border-zinc-800/90 rounded-2xl p-5 space-y-4 shadow-xl relative"
          >
            <button
              onClick={() => onDeleteCompetitor(comp.id)}
              className="absolute top-3 right-3 text-zinc-400 hover:text-rose-400 p-1"
              title="Remove Competitor"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3 pr-8">
              <img
                src={comp.iconUrl}
                alt={comp.name}
                className="w-12 h-12 rounded-xl object-cover border border-zinc-700"
              />
              <div className="min-w-0">
                <h3 className="font-bold text-white text-sm truncate">{comp.name}</h3>
                <p className="text-[11px] text-zinc-400 truncate">{comp.developer}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs bg-zinc-950 p-3 rounded-xl border border-zinc-800">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-semibold">Title:</span>
                <p className="font-mono text-zinc-200 mt-0.5 truncate">{comp.title}</p>
              </div>

              <div className="pt-1 border-t border-zinc-800">
                <span className="text-[10px] text-zinc-400 uppercase font-semibold">Subtitle:</span>
                <p className="font-mono text-zinc-200 mt-0.5 truncate">{comp.subtitle}</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs bg-zinc-950 p-3 rounded-xl border border-zinc-800">
              <div className="flex items-center space-x-1 text-amber-400">
                <Star className="w-4 h-4 fill-amber-400" />
                <span className="font-bold text-sm">{comp.averageUserRating}</span>
              </div>
              <span className="text-zinc-400 font-mono text-xs">
                {comp.userRatingCount.toLocaleString()} Reviews
              </span>
            </div>

            {/* Run Audit Button */}
            <button
              onClick={() => handleRunAiAudit(comp)}
              disabled={auditing}
              className="w-full bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Run Gemini ASO Gap Audit</span>
            </button>
          </div>
        ))}

        {app.competitors.length === 0 && (
          <div className="bg-zinc-900/60 border border-dashed border-zinc-800 rounded-2xl p-8 text-center text-zinc-400 space-y-3 col-span-2">
            <Users className="w-8 h-8 text-zinc-600 mx-auto" />
            <p className="text-xs">No competitors added yet.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              + Search App Store & Add Competitor
            </button>
          </div>
        )}
      </div>

      {/* AI Audit Report Result */}
      {auditReport && (
        <div className="bg-gradient-to-r from-zinc-900 via-purple-950/20 to-zinc-900 border border-purple-500/30 rounded-2xl p-6 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h2 className="text-base font-bold text-white">Gemini ASO Competitive Audit Report</h2>
            </div>
            <button
              onClick={() => setAuditReport(null)}
              className="text-xs text-zinc-400 hover:text-white"
            >
              Close
            </button>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed">{auditReport.summary}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                Recommended Win Strategies
              </span>
              <ul className="space-y-1.5 text-xs text-zinc-300">
                {auditReport.winOpportunities?.map((opp: string, i: number) => (
                  <li key={i} className="flex items-start space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{opp}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                Target Keyword Gap Opportunities
              </span>
              <div className="space-y-2">
                {auditReport.keywordGaps?.map((gap: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-xs bg-zinc-900 p-2 rounded-lg">
                    <div>
                      <p className="font-bold text-white">"{gap.keyword}"</p>
                      <p className="text-[10px] text-zinc-400">Action: {gap.action}</p>
                    </div>
                    <span className="font-mono text-amber-300 font-bold">
                      Vol {gap.searchVolume}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Competitor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Search className="w-4 h-4 text-purple-400" />
                <span>Search App Store for Competitor</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-white text-xs font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSearchAppStore} className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Search app name, developer, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                disabled={searching}
                className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors shrink-0"
              >
                {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
              </button>
            </form>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {searchResults.map((item) => (
                <div
                  key={item.trackId}
                  onClick={() => handleSelectSearchResult(item)}
                  className="flex items-center justify-between p-2.5 bg-zinc-950 hover:bg-zinc-800/80 border border-zinc-800 rounded-xl cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <img
                      src={item.artworkUrl100}
                      alt={item.trackName}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-white text-xs truncate">{item.trackName}</p>
                      <p className="text-[10px] text-zinc-400 truncate">{item.artistName}</p>
                    </div>
                  </div>
                  <button className="text-[11px] bg-purple-600 text-white font-semibold px-2.5 py-1 rounded-lg shrink-0">
                    Select
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
