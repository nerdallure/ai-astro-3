import React, { useState, useMemo } from "react";
import { TrackedKeyword } from "../types";
import {
  calculateKeywordRegression,
  RegressionResult,
} from "../utils/linearRegression";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  HelpCircle,
  Activity,
  Award,
  Zap,
} from "lucide-react";

interface PredictiveTrendsWidgetProps {
  keywords: TrackedKeyword[];
  selectedKeywordId?: string;
  onSelectKeyword?: (keyword: TrackedKeyword) => void;
}

export const PredictiveTrendsWidget: React.FC<PredictiveTrendsWidgetProps> = ({
  keywords,
  selectedKeywordId,
  onSelectKeyword,
}) => {
  // Pre-calculate regression for all keywords
  const regressionMap = useMemo(() => {
    const map = new Map<string, RegressionResult>();
    keywords.forEach((kw) => {
      map.set(kw.id, calculateKeywordRegression(kw, 14, 30));
    });
    return map;
  }, [keywords]);

  // Selected keyword for detailed chart
  const [activeKeywordId, setActiveKeywordId] = useState<string>(
    selectedKeywordId || (keywords[0]?.id ?? "")
  );

  const [tableFilter, setTableFilter] = useState<"all" | "rising" | "declining">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const activeKeyword = useMemo(() => {
    return keywords.find((k) => k.id === activeKeywordId) || keywords[0];
  }, [keywords, activeKeywordId]);

  const activeRegression = useMemo(() => {
    if (!activeKeyword) return null;
    return regressionMap.get(activeKeyword.id) || calculateKeywordRegression(activeKeyword, 14, 30);
  }, [activeKeyword, regressionMap]);

  // Portfolio-wide metrics
  const portfolioStats = useMemo(() => {
    let total30DChange = 0;
    let risingCount = 0;
    let decliningCount = 0;
    let topRisingKeyword: { keyword: TrackedKeyword; change: number } | null = null;
    let highestChange = -Infinity;

    keywords.forEach((kw) => {
      const reg = regressionMap.get(kw.id);
      if (reg) {
        total30DChange += reg.popularityChange30D;
        if (reg.popularityChange30D > 0) risingCount++;
        if (reg.popularityChange30D < 0) decliningCount++;

        if (reg.popularityChange30D > highestChange) {
          highestChange = reg.popularityChange30D;
          topRisingKeyword = { keyword: kw, change: reg.popularityChange30D };
        }
      }
    });

    const avgChange = keywords.length ? Math.round((total30DChange / keywords.length) * 10) / 10 : 0;

    return {
      avgChange,
      risingCount,
      decliningCount,
      topRisingKeyword,
    };
  }, [keywords, regressionMap]);

  // Filtered keywords list for table
  const filteredKeywords = useMemo(() => {
    return keywords.filter((kw) => {
      const reg = regressionMap.get(kw.id);
      const matchesSearch =
        kw.keyword.toLowerCase().includes(searchQuery.toLowerCase()) ||
        kw.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (tableFilter === "rising") return reg ? reg.popularityChange30D > 0 : false;
      if (tableFilter === "declining") return reg ? reg.popularityChange30D < 0 : false;
      return true;
    });
  }, [keywords, searchQuery, tableFilter, regressionMap]);

  if (!activeKeyword || !activeRegression) {
    return null;
  }

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-5">
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3.5">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-xl text-indigo-400">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>30-Day Predictive Popularity Forecasting</span>
              <span className="text-[10px] bg-purple-500/15 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 rounded-full font-medium">
                Linear Regression Engine
              </span>
            </h3>
            <p className="text-[11px] text-zinc-400">
              Ordinary Least Squares (OLS) algorithm estimating search volume trajectory
            </p>
          </div>
        </div>

        {/* Portfolio Summary Pills */}
        <div className="flex items-center space-x-2 text-xs">
          <div className="bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-xl flex items-center space-x-2">
            <span className="text-zinc-500 text-[10px] uppercase font-bold">30D Portfolio Avg:</span>
            <span
              className={`font-mono font-bold ${
                portfolioStats.avgChange >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {portfolioStats.avgChange >= 0 ? `+${portfolioStats.avgChange}` : portfolioStats.avgChange} pop
            </span>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-xl flex items-center space-x-1.5 text-zinc-300">
            <span className="text-emerald-400 font-bold">{portfolioStats.risingCount}</span>
            <span className="text-zinc-500">Rising</span>
            <span>•</span>
            <span className="text-rose-400 font-bold">{portfolioStats.decliningCount}</span>
            <span className="text-zinc-500">Falling</span>
          </div>
        </div>
      </div>

      {/* Primary Forecast Chart + Metric Spotlight */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-start">
        {/* Main Chart (3 cols) */}
        <div className="lg:col-span-3 bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/60 pb-2">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-white text-sm">{activeKeyword.keyword}</span>
              <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-md">
                Current Pop: {activeKeyword.popularity}/100
              </span>
            </div>

            <div className="flex items-center space-x-3 text-[10px] text-zinc-400 font-mono">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                <span>Historical</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-0.5 bg-indigo-400 border-dashed inline-block" />
                <span>OLS Regression Fit</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block" />
                <span>30D Projection</span>
              </span>
            </div>
          </div>

          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={activeRegression.chartData}
                margin={{ top: 10, right: 15, bottom: 15, left: -15 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis
                  dataKey="label"
                  stroke="#a1a1aa"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: "#27272a" }}
                />
                <YAxis
                  domain={[0, 100]}
                  stroke="#a1a1aa"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: "#27272a" }}
                  unit=""
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const isFuture = data.forecast !== undefined && data.actual === undefined;

                      return (
                        <div className="bg-zinc-900 border border-zinc-700 p-3 rounded-xl shadow-2xl text-xs space-y-1.5 z-50">
                          <p className="font-bold text-white text-xs border-b border-zinc-800 pb-1 flex items-center justify-between">
                            <span>{label}</span>
                            <span className="text-[10px] font-mono text-indigo-400">
                              {isFuture ? "30-Day Forecast" : "Historical Step"}
                            </span>
                          </p>

                          {data.actual !== undefined && (
                            <div className="flex justify-between space-x-4 text-[11px]">
                              <span className="text-zinc-400">Actual Volume:</span>
                              <span className="font-mono font-bold text-emerald-400">
                                {data.actual}/100
                              </span>
                            </div>
                          )}

                          {data.fitted !== undefined && (
                            <div className="flex justify-between space-x-4 text-[11px]">
                              <span className="text-zinc-400">Regression Fit:</span>
                              <span className="font-mono text-indigo-300">{data.fitted}</span>
                            </div>
                          )}

                          {data.forecast !== undefined && (
                            <div className="flex justify-between space-x-4 text-[11px]">
                              <span className="text-zinc-400">Projected Popularity:</span>
                              <span className="font-mono font-bold text-purple-300">
                                {data.forecast}/100
                              </span>
                            </div>
                          )}

                          {data.forecastUpper !== undefined && (
                            <div className="text-[10px] text-zinc-500 font-mono pt-1 border-t border-zinc-800">
                              Confidence Interval: {data.forecastLower} - {data.forecastUpper}
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                {/* Prediction Interval Band for Forecast */}
                <Area
                  type="monotone"
                  dataKey="forecastUpper"
                  stroke="none"
                  fill="#c084fc"
                  fillOpacity={0.2}
                  isAnimationActive={false}
                />

                {/* Actual Historical Line */}
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#34d399"
                  strokeWidth={3}
                  dot={{ r: 3.5, fill: "#34d399" }}
                  name="Actual Popularity"
                  isAnimationActive={false}
                />

                {/* Regression Best-Fit Line */}
                <Line
                  type="linear"
                  dataKey="fitted"
                  stroke="#818cf8"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                  name="OLS Linear Fit"
                  isAnimationActive={false}
                />

                {/* 30-Day Forecast Line */}
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="#c084fc"
                  strokeWidth={3}
                  strokeDasharray="2 2"
                  dot={{ r: 4.5, fill: "#c084fc", stroke: "#ffffff", strokeWidth: 1.5 }}
                  name="30D Projected"
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Selected Keyword Regression Stats Panel (1 col) */}
        <div className="space-y-3">
          <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block border-b border-zinc-800 pb-1.5">
              Regression Metrics
            </span>

            <div>
              <span className="text-[11px] text-zinc-400 block">30-Day Popularity Estimate</span>
              <div className="flex items-baseline space-x-2 mt-0.5">
                <span className="text-2xl font-black text-white font-mono">
                  {activeRegression.projectedPopularity30D}
                </span>
                <span className="text-xs text-zinc-500 font-mono">/ 100</span>

                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center font-mono ml-auto ${
                    activeRegression.popularityChange30D >= 0
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  }`}
                >
                  {activeRegression.popularityChange30D >= 0 ? (
                    <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                  )}
                  {activeRegression.popularityChange30D >= 0 ? "+" : ""}
                  {activeRegression.popularityChange30D} pts ({activeRegression.percentChange30D}%)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-zinc-800/80">
              <div className="bg-zinc-900 p-2 rounded-lg border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">Linear Slope (m)</span>
                <span className="font-mono font-bold text-indigo-300">
                  {activeRegression.slope >= 0 ? `+${activeRegression.slope}` : activeRegression.slope} /day
                </span>
              </div>

              <div className="bg-zinc-900 p-2 rounded-lg border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">R-Squared (R²)</span>
                <span className="font-mono font-bold text-purple-300">
                  {Math.round(activeRegression.rSquared * 100)}%
                </span>
              </div>
            </div>

            <div className="pt-1">
              <span className="text-[10px] text-zinc-400 block mb-1">Model Trend Classification</span>
              <span className="text-xs font-semibold text-white bg-indigo-950/80 border border-indigo-500/30 px-2.5 py-1 rounded-lg block text-center">
                {activeRegression.trendLabel}
              </span>
            </div>

            <p className="text-[10px] text-zinc-500 leading-tight pt-1">
              *Linear model fit calculated over recent 14-day search volume samples with {activeRegression.confidenceLevel} statistical confidence.
            </p>
          </div>
        </div>
      </div>

      {/* All Keywords Predictive Trends Table */}
      <div className="space-y-3 pt-2 border-t border-zinc-800/80">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Keyword Popularity Trend Predictions ({filteredKeywords.length})</span>
          </h4>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-3 py-1 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center space-x-1 bg-zinc-950 border border-zinc-800 p-0.5 rounded-xl text-xs">
              <button
                onClick={() => setTableFilter("all")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                  tableFilter === "all" ? "bg-indigo-600 text-white font-bold" : "text-zinc-400 hover:text-white"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setTableFilter("rising")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                  tableFilter === "rising" ? "bg-emerald-600 text-white font-bold" : "text-zinc-400 hover:text-emerald-400"
                }`}
              >
                Rising
              </button>
              <button
                onClick={() => setTableFilter("declining")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                  tableFilter === "declining" ? "bg-rose-600 text-white font-bold" : "text-zinc-400 hover:text-rose-400"
                }`}
              >
                Falling
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950/40">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950 text-zinc-400 uppercase tracking-wider text-[10px] font-semibold border-b border-zinc-800">
              <tr>
                <th className="py-2.5 px-4">Keyword</th>
                <th className="py-2.5 px-3">Current Pop</th>
                <th className="py-2.5 px-3">30D Forecast</th>
                <th className="py-2.5 px-3">Estimated Delta</th>
                <th className="py-2.5 px-3">Slope (m)</th>
                <th className="py-2.5 px-3">Confidence (R²)</th>
                <th className="py-2.5 px-3">Trend Signal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-200">
              {filteredKeywords.map((kw) => {
                const reg = regressionMap.get(kw.id) || calculateKeywordRegression(kw, 14, 30);
                const isSelected = activeKeywordId === kw.id;

                return (
                  <tr
                    key={kw.id}
                    onClick={() => {
                      setActiveKeywordId(kw.id);
                      if (onSelectKeyword) onSelectKeyword(kw);
                    }}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-indigo-600/15 border-l-2 border-indigo-500 font-semibold"
                        : "hover:bg-zinc-800/40"
                    }`}
                  >
                    <td className="py-2.5 px-4">
                      <div className="font-medium text-white flex items-center space-x-2">
                        <span>{kw.keyword}</span>
                        {kw.currentRank !== null && (
                          <span className="text-[10px] font-mono text-zinc-500">
                            (Rank #{kw.currentRank})
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-2.5 px-3 font-mono font-medium text-amber-300">
                      {kw.popularity}/100
                    </td>

                    <td className="py-2.5 px-3 font-mono font-bold text-purple-300">
                      {reg.projectedPopularity30D}/100
                    </td>

                    <td className="py-2.5 px-3 font-mono">
                      <span
                        className={`inline-flex items-center font-bold text-xs ${
                          reg.popularityChange30D > 0
                            ? "text-emerald-400"
                            : reg.popularityChange30D < 0
                            ? "text-rose-400"
                            : "text-zinc-400"
                        }`}
                      >
                        {reg.popularityChange30D > 0 ? (
                          <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                        ) : reg.popularityChange30D < 0 ? (
                          <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                        ) : (
                          <Minus className="w-3.5 h-3.5 mr-0.5" />
                        )}
                        {reg.popularityChange30D > 0 ? "+" : ""}
                        {reg.popularityChange30D} pts
                      </span>
                    </td>

                    <td className="py-2.5 px-3 font-mono text-zinc-300">
                      {reg.slope >= 0 ? `+${reg.slope}` : reg.slope}
                    </td>

                    <td className="py-2.5 px-3 font-mono text-zinc-400">
                      {Math.round(reg.rSquared * 100)}%
                    </td>

                    <td className="py-2.5 px-3">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          reg.slope >= 0.25
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : reg.slope >= 0.05
                            ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                            : reg.slope <= -0.05
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : "bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        {reg.trendLabel}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
