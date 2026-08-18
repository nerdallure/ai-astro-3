import React, { useState } from "react";
import { TrackedKeyword } from "../types";
import { Sparkles, Zap, Flame, Target, Info, Filter, BarChart2, Grid } from "lucide-react";

interface KeywordHeatmapProps {
  keywords: TrackedKeyword[];
  selectedKeywordId?: string;
  onSelectKeyword: (keyword: TrackedKeyword) => void;
  onQuadrantFilter?: (quadrant: string | null) => void;
}

export const KeywordHeatmap: React.FC<KeywordHeatmapProps> = ({
  keywords,
  selectedKeywordId,
  onSelectKeyword,
  onQuadrantFilter,
}) => {
  const [viewMode, setViewMode] = useState<"matrix" | "tiles">("matrix");
  const [activeQuadrant, setActiveQuadrant] = useState<string | null>(null);

  // Helper to calculate opportunity score (0 to 100)
  // Higher popularity + lower difficulty = higher score
  const getOpportunityScore = (pop: number, diff: number) => {
    return Math.round((pop * (100 - diff)) / 100);
  };

  // Helper to get opportunity color & label
  const getOpportunityStyle = (score: number) => {
    if (score >= 45) {
      return {
        bg: "bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/40 text-emerald-300",
        badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
        glow: "shadow-emerald-950/50",
        label: "Sweet Spot",
        hex: "#10b981",
      };
    } else if (score >= 28) {
      return {
        bg: "bg-sky-500/15 hover:bg-sky-500/25 border-sky-500/40 text-sky-300",
        badgeBg: "bg-sky-500/20 text-sky-300 border-sky-500/30",
        glow: "shadow-sky-950/50",
        label: "Good Target",
        hex: "#06b6d4",
      };
    } else if (score >= 15) {
      return {
        bg: "bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/40 text-amber-300",
        badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/30",
        glow: "shadow-amber-950/50",
        label: "Competitive",
        hex: "#f59e0b",
      };
    } else {
      return {
        bg: "bg-rose-500/15 hover:bg-rose-500/25 border-rose-500/40 text-rose-300",
        badgeBg: "bg-rose-500/20 text-rose-300 border-rose-500/30",
        glow: "shadow-rose-950/50",
        label: "High Effort",
        hex: "#f43f5e",
      };
    }
  };

  // Categorize keywords into 4 matrix quadrants
  const sweetSpot = keywords.filter((k) => k.popularity > 40 && k.difficulty <= 50);
  const competitiveGiants = keywords.filter((k) => k.popularity > 40 && k.difficulty > 50);
  const nicheTargets = keywords.filter((k) => k.popularity <= 40 && k.difficulty <= 50);
  const lowOpportunity = keywords.filter((k) => k.popularity <= 40 && k.difficulty > 50);

  const handleQuadrantClick = (quadrantKey: string) => {
    if (activeQuadrant === quadrantKey) {
      setActiveQuadrant(null);
      if (onQuadrantFilter) onQuadrantFilter(null);
    } else {
      setActiveQuadrant(quadrantKey);
      if (onQuadrantFilter) onQuadrantFilter(quadrantKey);
    }
  };

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-xl text-indigo-400">
            <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>Keyword Opportunity Heatmap</span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-medium">
                Pop vs Difficulty
              </span>
            </h3>
            <p className="text-[11px] text-zinc-400">
              Color-coded by search volume potential and rank competition
            </p>
          </div>
        </div>

        {/* View Switcher: 2D Matrix vs Grid Tiles */}
        <div className="flex items-center space-x-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
          <button
            onClick={() => setViewMode("matrix")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === "matrix"
                ? "bg-indigo-600 text-white font-medium shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>2D Quadrants</span>
          </button>
          <button
            onClick={() => setViewMode("tiles")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === "tiles"
                ? "bg-indigo-600 text-white font-medium shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Heatmap Grid</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: 2D Opportunity Matrix */}
      {viewMode === "matrix" && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative">
            {/* Quadrant 1: Sweet Spot (High Pop, Low Diff) */}
            <div
              onClick={() => handleQuadrantClick("sweetSpot")}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                activeQuadrant === "sweetSpot"
                  ? "bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-950/60"
                  : "bg-emerald-950/20 hover:bg-emerald-950/30 border-emerald-500/30"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-1.5">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-300">
                    🎯 Sweet Spot (High Pop / Low Diff)
                  </span>
                </div>
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  {sweetSpot.length} keywords
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mb-3">
                High search demand with low competition. Highest ROI targets.
              </p>

              <div className="flex flex-wrap gap-1.5">
                {sweetSpot.length > 0 ? (
                  sweetSpot.map((kw) => (
                    <button
                      key={kw.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectKeyword(kw);
                      }}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                        selectedKeywordId === kw.id
                          ? "bg-emerald-500 text-zinc-950 border-emerald-300 font-bold shadow-md"
                          : "bg-emerald-950/80 text-emerald-200 border-emerald-500/40 hover:border-emerald-400"
                      }`}
                    >
                      {kw.keyword}
                      <span className="ml-1.5 text-[10px] opacity-80 font-mono">
                        (P:{kw.popularity} / D:{kw.difficulty})
                      </span>
                    </button>
                  ))
                ) : (
                  <span className="text-xs text-zinc-500 italic">No keywords in this quadrant</span>
                )}
              </div>
            </div>

            {/* Quadrant 2: High Competition Giants (High Pop, High Diff) */}
            <div
              onClick={() => handleQuadrantClick("competitiveGiants")}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                activeQuadrant === "competitiveGiants"
                  ? "bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/40 shadow-lg shadow-amber-950/60"
                  : "bg-amber-950/20 hover:bg-amber-950/30 border-amber-500/30"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-amber-300">
                    ⚔️ Fierce Competition (High Pop / High Diff)
                  </span>
                </div>
                <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                  {competitiveGiants.length} keywords
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mb-3">
                Massive search traffic, but requires top ratings & Search Ads budget.
              </p>

              <div className="flex flex-wrap gap-1.5">
                {competitiveGiants.length > 0 ? (
                  competitiveGiants.map((kw) => (
                    <button
                      key={kw.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectKeyword(kw);
                      }}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                        selectedKeywordId === kw.id
                          ? "bg-amber-500 text-zinc-950 border-amber-300 font-bold shadow-md"
                          : "bg-amber-950/80 text-amber-200 border-amber-500/40 hover:border-amber-400"
                      }`}
                    >
                      {kw.keyword}
                      <span className="ml-1.5 text-[10px] opacity-80 font-mono">
                        (P:{kw.popularity} / D:{kw.difficulty})
                      </span>
                    </button>
                  ))
                ) : (
                  <span className="text-xs text-zinc-500 italic">No keywords in this quadrant</span>
                )}
              </div>
            </div>

            {/* Quadrant 3: Niche Long-Tail (Low Pop, Low Diff) */}
            <div
              onClick={() => handleQuadrantClick("nicheTargets")}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                activeQuadrant === "nicheTargets"
                  ? "bg-sky-950/40 border-sky-500 ring-2 ring-sky-500/40 shadow-lg shadow-sky-950/60"
                  : "bg-sky-950/20 hover:bg-sky-950/30 border-sky-500/30"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-bold text-sky-300">
                    💡 Niche Opportunities (Low Pop / Low Diff)
                  </span>
                </div>
                <span className="text-[10px] font-mono bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-full font-bold">
                  {nicheTargets.length} keywords
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mb-3">
                Easy to rank #1. Great long-tail combination building blocks.
              </p>

              <div className="flex flex-wrap gap-1.5">
                {nicheTargets.length > 0 ? (
                  nicheTargets.map((kw) => (
                    <button
                      key={kw.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectKeyword(kw);
                      }}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                        selectedKeywordId === kw.id
                          ? "bg-sky-500 text-zinc-950 border-sky-300 font-bold shadow-md"
                          : "bg-sky-950/80 text-sky-200 border-sky-500/40 hover:border-sky-400"
                      }`}
                    >
                      {kw.keyword}
                      <span className="ml-1.5 text-[10px] opacity-80 font-mono">
                        (P:{kw.popularity} / D:{kw.difficulty})
                      </span>
                    </button>
                  ))
                ) : (
                  <span className="text-xs text-zinc-500 italic">No keywords in this quadrant</span>
                )}
              </div>
            </div>

            {/* Quadrant 4: Low Return (Low Pop, High Diff) */}
            <div
              onClick={() => handleQuadrantClick("lowOpportunity")}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                activeQuadrant === "lowOpportunity"
                  ? "bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/40 shadow-lg shadow-rose-950/60"
                  : "bg-rose-950/20 hover:bg-rose-950/30 border-rose-500/30"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-1.5">
                  <Info className="w-4 h-4 text-rose-400" />
                  <span className="text-xs font-bold text-rose-300">
                    ⚠️ Low Return (Low Pop / High Diff)
                  </span>
                </div>
                <span className="text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full font-bold">
                  {lowOpportunity.length} keywords
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mb-3">
                High effort to rank with minimal search volume. Low priority.
              </p>

              <div className="flex flex-wrap gap-1.5">
                {lowOpportunity.length > 0 ? (
                  lowOpportunity.map((kw) => (
                    <button
                      key={kw.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectKeyword(kw);
                      }}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                        selectedKeywordId === kw.id
                          ? "bg-rose-500 text-zinc-950 border-rose-300 font-bold shadow-md"
                          : "bg-rose-950/80 text-rose-200 border-rose-500/40 hover:border-rose-400"
                      }`}
                    >
                      {kw.keyword}
                      <span className="ml-1.5 text-[10px] opacity-80 font-mono">
                        (P:{kw.popularity} / D:{kw.difficulty})
                      </span>
                    </button>
                  ))
                ) : (
                  <span className="text-xs text-zinc-500 italic">No keywords in this quadrant</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Dense Color-Coded Heatmap Tiles */}
      {viewMode === "tiles" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {keywords.map((kw) => {
              const score = getOpportunityScore(kw.popularity, kw.difficulty);
              const style = getOpportunityStyle(score);
              const isSelected = selectedKeywordId === kw.id;

              return (
                <div
                  key={kw.id}
                  onClick={() => onSelectKeyword(kw)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${style.bg} ${
                    isSelected
                      ? "ring-2 ring-indigo-400 border-indigo-400 scale-[1.02] shadow-xl"
                      : "border-zinc-800"
                  }`}
                >
                  <div className="flex items-start justify-between gap-1 mb-2">
                    <p className="text-xs font-bold text-white truncate">{kw.keyword}</p>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border font-bold ${style.badgeBg}`}>
                      {score}%
                    </span>
                  </div>

                  <div className="space-y-1 text-[10px]">
                    <div className="flex items-center justify-between text-zinc-400">
                      <span>Search Volume:</span>
                      <span className="font-mono font-semibold text-amber-400">{kw.popularity}</span>
                    </div>
                    <div className="flex items-center justify-between text-zinc-400">
                      <span>Difficulty:</span>
                      <span className="font-mono font-semibold text-zinc-300">{kw.difficulty}</span>
                    </div>
                    <div className="flex items-center justify-between text-zinc-400 border-t border-zinc-800/60 pt-1 mt-1">
                      <span>Current Rank:</span>
                      <span className="font-mono font-bold text-white">
                        {kw.currentRank ? `#${kw.currentRank}` : "Unranked"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend & Summary */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-400">
        <div className="flex items-center space-x-3">
          <span className="font-medium text-zinc-300">Opportunity Legend:</span>
          <div className="flex items-center space-x-2">
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-emerald-400">Sweet Spot (≥45%)</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <span className="text-sky-400">Good (28-44%)</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-amber-400">Fierce (15-27%)</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-rose-400">Low (&lt;15%)</span>
            </span>
          </div>
        </div>

        <div className="text-zinc-500 italic">
          Formula: Popularity × (100 - Difficulty) / 100
        </div>
      </div>
    </div>
  );
};
