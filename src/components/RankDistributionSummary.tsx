import React from "react";
import { TrackedKeyword } from "../types";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from "recharts";
import { BarChart3, Trophy, Filter, X } from "lucide-react";

interface RankDistributionSummaryProps {
  keywords: TrackedKeyword[];
  activeRankFilter: string | null;
  onSelectRankFilter: (bucketId: string | null) => void;
}

export interface RankBucketData {
  id: string;
  label: string;
  count: number;
  percentage: number;
  color: string;
  keywords: string[];
}

export const RankDistributionSummary: React.FC<RankDistributionSummaryProps> = ({
  keywords,
  activeRankFilter,
  onSelectRankFilter,
}) => {
  const totalKeywords = keywords.length || 1;

  // Calculate rank distribution buckets
  const buckets: RankBucketData[] = [
    {
      id: "1-5",
      label: "Top 1–5",
      count: keywords.filter((k) => k.currentRank !== null && k.currentRank >= 1 && k.currentRank <= 5).length,
      percentage: 0,
      color: "#34d399", // Neon Emerald
      keywords: keywords
        .filter((k) => k.currentRank !== null && k.currentRank >= 1 && k.currentRank <= 5)
        .map((k) => k.keyword),
    },
    {
      id: "6-10",
      label: "Rank 6–10",
      count: keywords.filter((k) => k.currentRank !== null && k.currentRank >= 6 && k.currentRank <= 10).length,
      percentage: 0,
      color: "#818cf8", // Electric Indigo
      keywords: keywords
        .filter((k) => k.currentRank !== null && k.currentRank >= 6 && k.currentRank <= 10)
        .map((k) => k.keyword),
    },
    {
      id: "11-20",
      label: "Rank 11–20",
      count: keywords.filter((k) => k.currentRank !== null && k.currentRank >= 11 && k.currentRank <= 20).length,
      percentage: 0,
      color: "#38bdf8", // Electric Cyan
      keywords: keywords
        .filter((k) => k.currentRank !== null && k.currentRank >= 11 && k.currentRank <= 20)
        .map((k) => k.keyword),
    },
    {
      id: "21-50",
      label: "Rank 21–50",
      count: keywords.filter((k) => k.currentRank !== null && k.currentRank >= 21 && k.currentRank <= 50).length,
      percentage: 0,
      color: "#fbbf24", // Bright Amber
      keywords: keywords
        .filter((k) => k.currentRank !== null && k.currentRank >= 21 && k.currentRank <= 50)
        .map((k) => k.keyword),
    },
    {
      id: "50+",
      label: "50+ / Unranked",
      count: keywords.filter((k) => k.currentRank === null || k.currentRank > 50).length,
      percentage: 0,
      color: "#a1a1aa", // High Contrast Zinc
      keywords: keywords
        .filter((k) => k.currentRank === null || k.currentRank > 50)
        .map((k) => k.keyword),
    },
  ];

  // Calculate percentages
  buckets.forEach((b) => {
    b.percentage = Math.round((b.count / totalKeywords) * 100);
  });

  const rankedCount = keywords.filter((k) => k.currentRank !== null && k.currentRank <= 50).length;
  const visibilityRate = Math.round((rankedCount / totalKeywords) * 100);

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>Keyword Rank Distribution</span>
              <span className="text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
                {visibilityRate}% Visibility
              </span>
            </h3>
            <p className="text-[11px] text-zinc-400">
              Overview of current search engine rankings across {keywords.length} tracked keywords
            </p>
          </div>
        </div>

        {activeRankFilter && (
          <button
            onClick={() => onSelectRankFilter(null)}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-all cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <span>Clear Rank Filter ({activeRankFilter})</span>
            <X className="w-3.5 h-3.5 text-zinc-400" />
          </button>
        )}
      </div>

      {/* Main Layout: Bar Chart + Summary Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-center">
        {/* Recharts Bar Chart (2 cols) */}
        <div className="lg:col-span-2 h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={buckets}
              margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              onClick={(state: any) => {
                if (state && state.activePayload && state.activePayload.length) {
                  const clickedBucket = state.activePayload[0].payload as RankBucketData;
                  onSelectRankFilter(
                    activeRankFilter === clickedBucket.id ? null : clickedBucket.id
                  );
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="#a1a1aa"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#27272a" }}
              />
              <YAxis
                stroke="#a1a1aa"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#27272a" }}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(255, 255, 255, 0.03)" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as RankBucketData;
                    return (
                      <div className="bg-zinc-900 border border-zinc-700 p-3 rounded-xl shadow-2xl space-y-1.5 text-xs max-w-xs">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                          <span className="font-bold text-white">{data.label}</span>
                          <span className="font-mono text-zinc-400 text-[10px]">
                            {data.percentage}% of total
                          </span>
                        </div>
                        <p className="text-zinc-300 font-medium">
                          Keywords: <strong className="text-white">{data.count}</strong>
                        </p>
                        {data.keywords.length > 0 && (
                          <div className="text-[10px] text-zinc-400 pt-1">
                            <span className="text-zinc-500 font-semibold block mb-1">Examples:</span>
                            <p className="text-indigo-300 truncate">
                              {data.keywords.slice(0, 4).join(", ")}
                              {data.keywords.length > 4 ? ` +${data.keywords.length - 4} more` : ""}
                            </p>
                          </div>
                        )}
                        <p className="text-[10px] text-zinc-500 italic pt-1">
                          Click bar to filter list
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} cursor="pointer">
                {buckets.map((entry) => {
                  const isSelected = activeRankFilter === entry.id;
                  return (
                    <Cell
                      key={`cell-${entry.id}`}
                      fill={entry.color}
                      opacity={activeRankFilter && !isSelected ? 0.35 : 0.9}
                      stroke={isSelected ? "#ffffff" : "none"}
                      strokeWidth={isSelected ? 2 : 0}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Breakdown Metric Cards (1 col) */}
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
          {buckets.map((bucket) => {
            const isSelected = activeRankFilter === bucket.id;

            return (
              <div
                key={bucket.id}
                onClick={() =>
                  onSelectRankFilter(isSelected ? null : bucket.id)
                }
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? "bg-zinc-800 border-indigo-500 ring-1 ring-indigo-500/50 shadow-md"
                    : "bg-zinc-950/60 hover:bg-zinc-800/60 border-zinc-800/80"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: bucket.color }}
                  />
                  <div>
                    <p className="text-xs font-semibold text-zinc-200">{bucket.label}</p>
                    <p className="text-[10px] text-zinc-400 font-mono">{bucket.percentage}% of keywords</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-extrabold text-white font-mono">{bucket.count}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
