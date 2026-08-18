import React, { useState } from "react";
import { TrackedKeyword } from "../types";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  Cell,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { Target, HelpCircle, TrendingUp, Sparkles, Filter, X } from "lucide-react";

interface DifficultyVsRankScatterProps {
  keywords: TrackedKeyword[];
  selectedKeywordId?: string;
  onSelectKeyword: (keyword: TrackedKeyword) => void;
}

interface ScatterPointData {
  id: string;
  keyword: string;
  difficulty: number;
  rank: number; // 1 to 50 or 100
  popularity: number;
  estimatedInstalls: number;
  tags: string[];
  rankBracket: "Top 5" | "6-10" | "11-20" | "21-50" | "50+";
  color: string;
  rawKeyword: TrackedKeyword;
}

export const DifficultyVsRankScatter: React.FC<DifficultyVsRankScatterProps> = ({
  keywords,
  selectedKeywordId,
  onSelectKeyword,
}) => {
  const [filterDifficultyCategory, setFilterDifficultyCategory] = useState<string | null>(null);

  // Prepare scatter plot data
  const dataPoints: ScatterPointData[] = keywords
    .map((kw) => {
      const rank = kw.currentRank !== null ? kw.currentRank : 60; // default 60 for unranked
      let rankBracket: "Top 5" | "6-10" | "11-20" | "21-50" | "50+" = "50+";
      let color = "#71717a"; // zinc

      if (rank <= 5) {
        rankBracket = "Top 5";
        color = "#34d399"; // Neon Emerald
      } else if (rank <= 10) {
        rankBracket = "6-10";
        color = "#818cf8"; // Electric Indigo
      } else if (rank <= 20) {
        rankBracket = "11-20";
        color = "#38bdf8"; // Electric Cyan
      } else if (rank <= 50) {
        rankBracket = "21-50";
        color = "#fbbf24"; // Bright Amber
      }

      return {
        id: kw.id,
        keyword: kw.keyword,
        difficulty: kw.difficulty,
        rank: rank,
        popularity: kw.popularity,
        estimatedInstalls: kw.estimatedInstalls,
        tags: kw.tags,
        rankBracket,
        color,
        rawKeyword: kw,
      };
    })
    .filter((pt) => {
      if (!filterDifficultyCategory) return true;
      if (filterDifficultyCategory === "low") return pt.difficulty <= 35;
      if (filterDifficultyCategory === "medium") return pt.difficulty > 35 && pt.difficulty <= 60;
      if (filterDifficultyCategory === "high") return pt.difficulty > 60;
      return true;
    });

  // Calculate statistics & correlation
  const rankedKeywords = keywords.filter((k) => k.currentRank !== null && k.currentRank <= 50);
  const totalCount = keywords.length || 1;

  // Average difficulty for top 10 keywords
  const top10Keywords = keywords.filter((k) => k.currentRank !== null && k.currentRank <= 10);
  const avgTop10Diff = top10Keywords.length
    ? Math.round(top10Keywords.reduce((a, b) => a + b.difficulty, 0) / top10Keywords.length)
    : 0;

  // Average difficulty for keywords ranked > 10
  const outside10Keywords = keywords.filter((k) => k.currentRank === null || k.currentRank > 10);
  const avgOutside10Diff = outside10Keywords.length
    ? Math.round(
        outside10Keywords.reduce((a, b) => a + b.difficulty, 0) / outside10Keywords.length
      )
    : 0;

  // Calculate Pearson correlation coefficient r between Difficulty and Rank (for ranked keywords)
  let correlationScore = 0;
  if (rankedKeywords.length > 1) {
    const n = rankedKeywords.length;
    const sumX = rankedKeywords.reduce((a, b) => a + b.difficulty, 0);
    const sumY = rankedKeywords.reduce((a, b) => a + (b.currentRank || 50), 0);
    const sumXY = rankedKeywords.reduce((a, b) => a + b.difficulty * (b.currentRank || 50), 0);
    const sumX2 = rankedKeywords.reduce((a, b) => a + b.difficulty * b.difficulty, 0);
    const sumY2 = rankedKeywords.reduce(
      (a, b) => a + (b.currentRank || 50) * (b.currentRank || 50),
      0
    );

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    if (denominator !== 0) {
      correlationScore = Math.round((numerator / denominator) * 100) / 100;
    }
  }

  // Opportunity count: Low Difficulty (<= 45) but low rank / unranked (> 15)
  const opportunityKeywords = keywords.filter(
    (k) => k.difficulty <= 45 && (k.currentRank === null || k.currentRank > 15)
  );

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
            <Target className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>Keyword Difficulty vs. Rank Correlation</span>
              <span className="text-[10px] bg-purple-500/15 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-medium">
                r = {correlationScore > 0 ? `+${correlationScore}` : correlationScore} Correlation
              </span>
            </h3>
            <p className="text-[11px] text-zinc-400">
              Analyze if higher competition affects your store rankings across {keywords.length} keywords
            </p>
          </div>
        </div>

        {/* Difficulty Filter Quick Toggles */}
        <div className="flex items-center space-x-1.5 text-xs bg-zinc-950 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setFilterDifficultyCategory(null)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
              filterDifficultyCategory === null
                ? "bg-purple-600 text-white font-bold"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            All Diff
          </button>
          <button
            onClick={() => setFilterDifficultyCategory("low")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
              filterDifficultyCategory === "low"
                ? "bg-emerald-600 text-white font-bold"
                : "text-zinc-400 hover:text-emerald-400"
            }`}
          >
            Easy (≤35)
          </button>
          <button
            onClick={() => setFilterDifficultyCategory("medium")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
              filterDifficultyCategory === "medium"
                ? "bg-amber-600 text-white font-bold"
                : "text-zinc-400 hover:text-amber-400"
            }`}
          >
            Medium (36-60)
          </button>
          <button
            onClick={() => setFilterDifficultyCategory("high")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
              filterDifficultyCategory === "high"
                ? "bg-rose-600 text-white font-bold"
                : "text-zinc-400 hover:text-rose-400"
            }`}
          >
            Hard (&gt;60)
          </button>
        </div>
      </div>

      {/* Main Scatter Layout: Recharts Scatter Chart + Key Insight Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-center">
        {/* Scatter Chart (3 cols) */}
        <div className="lg:col-span-3 h-60 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 15, right: 20, bottom: 20, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis
                type="number"
                dataKey="difficulty"
                name="Keyword Difficulty"
                domain={[0, 100]}
                unit=""
                stroke="#a1a1aa"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#27272a" }}
                label={{
                  value: "Keyword Difficulty (0-100)",
                  position: "insideBottom",
                  offset: -12,
                  fill: "#71717a",
                  fontSize: 10,
                }}
              />
              <YAxis
                type="number"
                dataKey="rank"
                name="Current Rank"
                domain={[1, 60]}
                reversed={true} // Reverses Y axis so Rank #1 is at the top!
                stroke="#a1a1aa"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#27272a" }}
                tickFormatter={(val) => (val >= 55 ? "50+" : `#${val}`)}
                label={{
                  value: "Search Rank (#1 is best)",
                  angle: -90,
                  position: "insideLeft",
                  offset: 15,
                  fill: "#71717a",
                  fontSize: 10,
                }}
              />
              <ZAxis type="number" dataKey="popularity" range={[50, 350]} name="ASA Popularity" />

              <Tooltip
                cursor={{ strokeDasharray: "3 3", stroke: "#6366f1" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as ScatterPointData;
                    const isSelected = selectedKeywordId === data.id;

                    return (
                      <div className="bg-zinc-900 border border-zinc-700 p-3 rounded-xl shadow-2xl space-y-2 text-xs max-w-xs z-50">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                          <span className="font-bold text-white text-sm">{data.keyword}</span>
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                            style={{ backgroundColor: `${data.color}20`, color: data.color }}
                          >
                            {data.rank <= 50 ? `Rank #${data.rank}` : "50+ Unranked"}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                            <span className="text-zinc-500 block text-[10px]">Difficulty</span>
                            <span className="font-bold text-white font-mono">
                              {data.difficulty}/100
                            </span>
                          </div>
                          <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                            <span className="text-zinc-500 block text-[10px]">ASA Popularity</span>
                            <span className="font-bold text-indigo-400 font-mono">
                              {data.popularity}/100
                            </span>
                          </div>
                        </div>

                        {data.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {data.tags.map((t) => (
                              <span
                                key={t}
                                className="text-[9px] bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded font-mono"
                              >
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}

                        <p className="text-[10px] text-indigo-300 italic pt-1 border-t border-zinc-800/80">
                          Click point to inspect keyword details
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* Top 10 Target Zone Reference Line */}
              <ReferenceLine y={10} stroke="#6366f1" strokeDasharray="4 4" label={{ value: "Top 10 Benchmark", fill: "#818cf8", fontSize: 10, position: "right" }} />
              {/* Moderate Difficulty Line */}
              <ReferenceLine x={45} stroke="#3f3f46" strokeDasharray="3 3" />

              <Scatter
                name="Keywords"
                data={dataPoints}
                onClick={(entry: ScatterPointData) => {
                  if (entry && entry.rawKeyword) {
                    onSelectKeyword(entry.rawKeyword);
                  }
                }}
                cursor="pointer"
              >
                {dataPoints.map((entry) => {
                  const isSelected = selectedKeywordId === entry.id;
                  return (
                    <Cell
                      key={`scatter-cell-${entry.id}`}
                      fill={entry.color}
                      stroke={isSelected ? "#ffffff" : "#000000"}
                      strokeWidth={isSelected ? 2.5 : 1}
                      r={isSelected ? 7 : 5}
                    />
                  );
                })}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Insight Breakdown Sidebar (1 col) */}
        <div className="space-y-2.5">
          <div className="bg-zinc-950/70 border border-zinc-800 p-3 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Avg Top 10 Diff:</span>
              <span className="font-bold font-mono text-emerald-400">{avgTop10Diff}/100</span>
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Avg Outside 10 Diff:</span>
              <span className="font-bold font-mono text-amber-400">{avgOutside10Diff}/100</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-zinc-950 border border-indigo-500/30 p-3 rounded-xl space-y-1">
            <div className="flex items-center space-x-1.5 text-xs text-indigo-300 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Low Hanging Opportunities</span>
            </div>
            <p className="text-[11px] text-zinc-300">
              <strong className="text-white font-mono text-sm">{opportunityKeywords.length}</strong> keywords have Low Difficulty (&le;45) but rank below #15.
            </p>
          </div>

          <div className="p-2.5 bg-zinc-950/50 border border-zinc-800/80 rounded-xl space-y-1 text-[11px] text-zinc-400">
            <p className="font-semibold text-zinc-300 flex items-center space-x-1">
              <HelpCircle className="w-3 h-3 text-purple-400" />
              <span>Chart Legend:</span>
            </p>
            <div className="grid grid-cols-2 gap-1 text-[10px]">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-zinc-300">Top 1–5</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span className="text-zinc-300">Rank 6–10</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                <span className="text-zinc-300">Rank 11–20</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-zinc-300">Rank 21–50</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
