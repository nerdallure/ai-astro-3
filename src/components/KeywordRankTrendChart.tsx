import React, { useState, useMemo } from "react";
import { TrackedKeyword } from "../types";
import {
  get30DayRankHistory,
  get30DayRankAnalytics,
  ExtendedRankHistoryPoint,
} from "../utils/rankHistory";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  Calendar,
  BarChart2,
  Maximize2,
  X,
  Sparkles,
  Layers,
  Download,
  Info,
  Flame,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface KeywordRankTrendChartProps {
  keyword: TrackedKeyword;
  comparisonKeywords?: TrackedKeyword[];
  compact?: boolean; // For smaller sidebars or quick cards
  titlePrefix?: string;
  onSelectKeyword?: (keyword: TrackedKeyword) => void;
}

const COMPARISON_COLORS = [
  "#818cf8", // Electric Indigo
  "#34d399", // Neon Emerald
  "#fbbf24", // Bright Amber
  "#f43f5e", // Vivid Rose
  "#38bdf8", // Electric Cyan
  "#c084fc", // Vibrant Purple
  "#fb923c", // Vibrant Orange
];

export const KeywordRankTrendChart: React.FC<KeywordRankTrendChartProps> = ({
  keyword,
  comparisonKeywords = [],
  compact = false,
  titlePrefix = "30-Day Rank Trend",
  onSelectKeyword,
}) => {
  const [timeframe, setTimeframe] = useState<7 | 14 | 30>(30);
  const [showMultiCompare, setShowMultiCompare] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showTableDrawer, setShowTableDrawer] = useState<boolean>(false);

  // Compute 30-day raw history points
  const raw30DayPoints = useMemo(() => {
    return get30DayRankHistory(keyword, 30);
  }, [keyword]);

  // Filter points according to selected timeframe (7, 14, 30)
  const displayPoints = useMemo(() => {
    return raw30DayPoints.slice(30 - timeframe);
  }, [raw30DayPoints, timeframe]);

  // Compute analytics
  const analytics = useMemo(() => {
    return get30DayRankAnalytics(displayPoints);
  }, [displayPoints]);

  // Multi-keyword comparison dataset computation
  const comparisonData = useMemo(() => {
    if (!comparisonKeywords || comparisonKeywords.length === 0) return [];

    const allKeywords = [keyword, ...comparisonKeywords.slice(0, 5)];
    const keywordHistories = allKeywords.map((kw) => ({
      kw,
      points: get30DayRankHistory(kw, 30).slice(30 - timeframe),
    }));

    // Merge points by date index
    const mergedPoints = [];
    const basePoints = keywordHistories[0].points;

    for (let i = 0; i < basePoints.length; i++) {
      const entry: Record<string, any> = {
        date: basePoints[i].date,
        fullDate: basePoints[i].fullDate,
      };

      keywordHistories.forEach(({ kw, points }) => {
        if (points[i]) {
          entry[kw.id] = points[i].rank;
        }
      });

      mergedPoints.push(entry);
    }

    return mergedPoints;
  }, [keyword, comparisonKeywords, timeframe]);

  // Download CSV of 30-day rank history
  const handleDownloadCSV = () => {
    const headers = ["Date", "Full Date", "Rank", "Previous Rank", "Change", "Status"];
    const rows = raw30DayPoints.map((p) => [
      p.date,
      p.fullDate,
      p.rank,
      p.previousRank !== null ? p.previousRank : "N/A",
      p.change > 0 ? `+${p.change}` : p.change,
      p.statusTag,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${keyword.keyword.replace(/\s+/g, "_")}_30day_rank_trend.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Determine accent color gradient depending on rank performance
  const getRankThemeColor = (currentRank: number | null) => {
    if (!currentRank) return { stroke: "#a1a1aa", stop: "#3f3f46" };
    if (currentRank === 1) return { stroke: "#fbbf24", stop: "#f59e0b" }; // Gold
    if (currentRank <= 3) return { stroke: "#34d399", stop: "#10b981" }; // Neon Emerald
    if (currentRank <= 10) return { stroke: "#818cf8", stop: "#6366f1" }; // Electric Violet/Indigo
    return { stroke: "#38bdf8", stop: "#0284c7" }; // Bright Sky Blue
  };

  const themeColors = getRankThemeColor(keyword.currentRank);

  return (
    <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-indigo-950/40 border border-zinc-700/80 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 shadow-md shadow-indigo-500/20">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider">
                {titlePrefix}
              </span>
              <span className="text-[9px] bg-indigo-950/80 text-indigo-300 font-mono px-2 py-0.5 rounded-full border border-indigo-500/30">
                Recharts Live
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center space-x-2">
              <span>"{keyword.keyword}"</span>
              {keyword.currentRank && (
                <span className="text-xs bg-indigo-500/30 text-indigo-200 font-mono font-bold px-2.5 py-0.5 rounded-md border border-indigo-400/40 shadow-sm">
                  Current: #{keyword.currentRank}
                </span>
              )}
            </h3>
          </div>
        </div>

        {/* Timeframe Selectors & View Actions */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
          <div className="bg-zinc-950 p-1 rounded-xl border border-zinc-700/80 flex items-center space-x-1 shrink-0">
            {([7, 14, 30] as const).map((days) => (
              <button
                key={days}
                onClick={() => setTimeframe(days)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                  timeframe === days
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/40"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {days}D
              </button>
            ))}
          </div>

          {comparisonKeywords.length > 0 && (
            <button
              onClick={() => setShowMultiCompare(!showMultiCompare)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
                showMultiCompare
                  ? "bg-amber-500/30 border-amber-400/60 text-amber-200 shadow-md shadow-amber-500/20"
                  : "bg-zinc-950 border-zinc-700 text-zinc-300 hover:text-white"
              }`}
              title="Compare multiple keyword rank trajectories"
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Compare ({comparisonKeywords.length + 1})</span>
            </button>
          )}

          <button
            onClick={() => setShowModal(true)}
            className="p-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition-all shrink-0 cursor-pointer"
            title="Expand to Fullscreen View"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Analytics KPI Metrics Cards */}
      {!compact && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <div className="bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-500/40 shadow-lg shadow-emerald-950/20">
            <span className="text-[10px] text-emerald-300/80 uppercase font-semibold block">Best Rank ({timeframe}D)</span>
            <p className="text-sm font-extrabold text-emerald-300 mt-0.5 flex items-center space-x-1 font-mono">
              <Award className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>#{analytics.bestRank}</span>
            </p>
          </div>

          <div className="bg-rose-950/30 p-2.5 rounded-xl border border-rose-500/30 shadow-lg shadow-rose-950/20">
            <span className="text-[10px] text-rose-300/80 uppercase font-semibold block">Lowest Rank ({timeframe}D)</span>
            <p className="text-sm font-extrabold text-rose-300 mt-0.5 font-mono">
              #{analytics.worstRank}
            </p>
          </div>

          <div className="bg-indigo-950/40 p-2.5 rounded-xl border border-indigo-500/40 shadow-lg shadow-indigo-950/20">
            <span className="text-[10px] text-indigo-300/80 uppercase font-semibold block">Avg Position</span>
            <p className="text-sm font-extrabold text-indigo-300 mt-0.5 font-mono">
              #{analytics.avgRank}
            </p>
          </div>

          <div className="bg-cyan-950/40 p-2.5 rounded-xl border border-cyan-500/40 shadow-lg shadow-cyan-950/20">
            <span className="text-[10px] text-cyan-300/80 uppercase font-semibold block">Net Delta ({timeframe}D)</span>
            <p
              className={`text-sm font-extrabold mt-0.5 flex items-center space-x-1 font-mono ${
                analytics.netChange > 0
                  ? "text-emerald-300"
                  : analytics.netChange < 0
                  ? "text-rose-300"
                  : "text-zinc-300"
              }`}
            >
              {analytics.netChange > 0 ? (
                <>
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span>+{analytics.netChange} spots</span>
                </>
              ) : analytics.netChange < 0 ? (
                <>
                  <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                  <span>{analytics.netChange} spots</span>
                </>
              ) : (
                <>
                  <Minus className="w-3.5 h-3.5 text-zinc-400" />
                  <span>No change</span>
                </>
              )}
            </p>
          </div>

          <div className="bg-amber-950/40 p-2.5 rounded-xl border border-amber-500/40 shadow-lg shadow-amber-950/20 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-amber-300/80 uppercase font-semibold block">Top 10 Presence</span>
            <p className="text-sm font-extrabold text-amber-300 mt-0.5 font-mono flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{analytics.top10Percentage}% of days</span>
            </p>
          </div>
        </div>
      )}

      {/* Main Recharts Chart View */}
      <div className="bg-zinc-950 p-3 sm:p-4 rounded-xl border border-zinc-800 relative shadow-inner">
        <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-2 font-mono">
          <span className="flex items-center space-x-1">
            <Calendar className="w-3 h-3 text-indigo-400" />
            <span>Showing last {timeframe} days trajectory</span>
          </span>
          <span className="italic text-zinc-400">Inverted Y-Axis (#1 rank is top)</span>
        </div>

        <div className={`w-full ${compact ? "h-40" : "h-56 sm:h-64"}`}>
          <ResponsiveContainer width="100%" height="100%">
            {!showMultiCompare ? (
              <AreaChart
                data={displayPoints}
                margin={{ top: 12, right: 12, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id={`rankGradient-${keyword.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={themeColors.stroke} stopOpacity={0.65} />
                    <stop offset="100%" stopColor={themeColors.stop} stopOpacity={0.05} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />

                <XAxis
                  dataKey="date"
                  stroke="#a1a1aa"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: "#3f3f46" }}
                />

                <YAxis
                  reversed={true}
                  domain={[1, (dataMax: number) => Math.max(dataMax + 2, 20)]}
                  stroke="#a1a1aa"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: "#3f3f46" }}
                  tickFormatter={(val) => `#${val}`}
                  allowDecimals={false}
                />

                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as ExtendedRankHistoryPoint;
                      return (
                        <div className="bg-zinc-900 border border-zinc-700/90 p-3 rounded-xl shadow-2xl text-xs space-y-1.5 min-w-[160px]">
                          <div className="flex items-center justify-between border-b border-zinc-800 pb-1">
                            <span className="text-zinc-400 font-mono text-[10px]">{data.date} ({data.fullDate})</span>
                            <span className="text-[9px] bg-indigo-500/30 text-indigo-200 px-1.5 py-0.2 rounded font-mono font-bold border border-indigo-400/30">
                              {data.statusTag}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-zinc-300 font-medium">Rank:</span>
                            <span className="font-extrabold text-white text-sm font-mono">
                              #{data.rank}
                            </span>
                          </div>

                          {data.previousRank && (
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-zinc-400">Daily Delta:</span>
                              <span
                                className={`font-mono font-bold flex items-center ${
                                  data.change > 0
                                    ? "text-emerald-400"
                                    : data.change < 0
                                    ? "text-rose-400"
                                    : "text-zinc-400"
                                }`}
                              >
                                {data.change > 0 ? (
                                  <>
                                    <TrendingUp className="w-3 h-3 mr-0.5" />+{data.change}
                                  </>
                                ) : data.change < 0 ? (
                                  <>
                                    <TrendingDown className="w-3 h-3 mr-0.5" />
                                    {data.change}
                                  </>
                                ) : (
                                  "No move"
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                {/* Reference lines for top rankings */}
                <ReferenceLine y={1} stroke="#fbbf24" strokeWidth={1.5} strokeDasharray="3 3" label={{ value: "#1", fill: "#fbbf24", fontSize: 10, fontWeight: "bold" }} />
                <ReferenceLine y={3} stroke="#34d399" strokeWidth={1.5} strokeDasharray="3 3" label={{ value: "Top 3", fill: "#34d399", fontSize: 10, fontWeight: "bold" }} />
                <ReferenceLine y={10} stroke="#818cf8" strokeWidth={1.5} strokeDasharray="3 3" label={{ value: "Top 10", fill: "#818cf8", fontSize: 10, fontWeight: "bold" }} />

                <Area
                  type="monotone"
                  dataKey="rank"
                  stroke={themeColors.stroke}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill={`url(#rankGradient-${keyword.id})`}
                  dot={{ r: 4, fill: themeColors.stroke, stroke: "#09090b", strokeWidth: 2 }}
                  activeDot={{ r: 7, fill: "#ffffff", stroke: themeColors.stroke, strokeWidth: 2.5 }}
                />
              </AreaChart>
            ) : (
              // Multi-Keyword Comparison Line Chart
              <LineChart
                data={comparisonData}
                margin={{ top: 12, right: 12, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#a1a1aa"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: "#3f3f46" }}
                />
                <YAxis
                  reversed={true}
                  domain={[1, 50]}
                  stroke="#a1a1aa"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: "#3f3f46" }}
                  tickFormatter={(val) => `#${val}`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-zinc-900 border border-zinc-700 p-3 rounded-xl shadow-2xl text-xs space-y-1.5 min-w-[180px]">
                          <p className="text-zinc-400 font-mono text-[10px] border-b border-zinc-800 pb-1">
                            {label}
                          </p>
                          <div className="space-y-1">
                            {payload.map((p, idx) => {
                              const kwItem = [keyword, ...comparisonKeywords].find(
                                (k) => k.id === p.dataKey
                              );
                              return (
                                <div key={idx} className="flex items-center justify-between space-x-3">
                                  <span className="text-zinc-300 font-semibold truncate max-w-[110px]" style={{ color: p.color }}>
                                    "{kwItem?.keyword || p.dataKey}"
                                  </span>
                                  <span className="font-mono font-bold text-white">
                                    #{p.value}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                  formatter={(value) => {
                    const kwItem = [keyword, ...comparisonKeywords].find((k) => k.id === value);
                    return <span className="text-zinc-200 font-medium">"{kwItem?.keyword || value}"</span>;
                  }}
                />

                {[keyword, ...comparisonKeywords.slice(0, 5)].map((kw, idx) => (
                  <Line
                    key={kw.id}
                    type="monotone"
                    dataKey={kw.id}
                    stroke={COMPARISON_COLORS[idx % COMPARISON_COLORS.length]}
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: COMPARISON_COLORS[idx % COMPARISON_COLORS.length] }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer Controls: Data Table Drawer & CSV Download */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs pt-1">
        <button
          onClick={() => setShowTableDrawer(!showTableDrawer)}
          className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1 cursor-pointer"
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>{showTableDrawer ? "Hide Daily Rank Logs" : "View Day-by-Day Rank Breakdown"}</span>
        </button>

        <button
          onClick={handleDownloadCSV}
          className="bg-zinc-950 hover:bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-xl border border-zinc-800 transition-colors flex items-center space-x-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-zinc-400" />
          <span>Export 30D CSV Log</span>
        </button>
      </div>

      {/* Day-by-day Table Log Drawer */}
      {showTableDrawer && (
        <div className="bg-zinc-950/90 border border-zinc-800 rounded-xl p-3 overflow-x-auto space-y-2 animate-fade-in">
          <div className="flex items-center justify-between text-xs text-zinc-400 pb-1 border-b border-zinc-800 font-mono">
            <span>Daily History Logs ({displayPoints.length} Entries)</span>
            <span>Anchor Date: 2026-08-11</span>
          </div>

          <table className="w-full text-left text-xs font-mono">
            <thead className="text-zinc-500 uppercase text-[9px] border-b border-zinc-800">
              <tr>
                <th className="py-1.5 px-2">Date</th>
                <th className="py-1.5 px-2">Rank</th>
                <th className="py-1.5 px-2">Daily Change</th>
                <th className="py-1.5 px-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
              {displayPoints.slice().reverse().map((p, idx) => (
                <tr key={idx} className="hover:bg-zinc-900/60">
                  <td className="py-1.5 px-2 text-zinc-400">{p.date}</td>
                  <td className="py-1.5 px-2 font-bold text-white">#{p.rank}</td>
                  <td className="py-1.5 px-2">
                    <span
                      className={
                        p.change > 0
                          ? "text-emerald-400 font-bold"
                          : p.change < 0
                          ? "text-rose-400"
                          : "text-zinc-500"
                      }
                    >
                      {p.change > 0 ? `+${p.change}` : p.change === 0 ? "0" : p.change}
                    </span>
                  </td>
                  <td className="py-1.5 px-2">
                    <span className="text-[9px] bg-zinc-800 text-zinc-300 px-1.5 py-0.2 rounded">
                      {p.statusTag}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Fullscreen Inspector Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-4xl p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs mb-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>30-Day Historical ASO Rank Analytics</span>
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  "{keyword.keyword}" Full Historical Trajectory
                </h2>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Recharts View */}
            <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                <span>30-Day Recharts Inspection Grid</span>
                <span>Y-Axis: App Store Position</span>
              </div>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={raw30DayPoints}
                    margin={{ top: 15, right: 15, left: -15, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id={`modalGradient-${keyword.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={themeColors.stroke} stopOpacity={0.5} />
                        <stop offset="95%" stopColor={themeColors.stroke} stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickLine={false} />
                    <YAxis
                      reversed={true}
                      domain={[1, (dataMax: number) => Math.max(dataMax + 2, 20)]}
                      stroke="#71717a"
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(v) => `#${v}`}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload as ExtendedRankHistoryPoint;
                          return (
                            <div className="bg-zinc-900 border border-zinc-700 p-3.5 rounded-xl shadow-2xl text-xs space-y-1.5 font-sans">
                              <p className="text-zinc-400 font-mono text-[10px]">{data.fullDate}</p>
                              <p className="text-white font-extrabold text-base font-mono">
                                Rank #{data.rank}
                              </p>
                              <p className="text-indigo-300 font-medium">{data.statusTag}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <ReferenceLine y={1} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: "Rank #1", fill: "#f59e0b" }} />
                    <ReferenceLine y={3} stroke="#10b981" strokeDasharray="3 3" label={{ value: "Top 3", fill: "#10b981" }} />
                    <ReferenceLine y={10} stroke="#6366f1" strokeDasharray="3 3" label={{ value: "Top 10", fill: "#6366f1" }} />

                    <Area
                      type="monotone"
                      dataKey="rank"
                      stroke={themeColors.stroke}
                      strokeWidth={3}
                      fillOpacity={1}
                      fill={`url(#modalGradient-${keyword.id})`}
                      dot={{ r: 4, fill: themeColors.stroke, stroke: "#18181b", strokeWidth: 2 }}
                      activeDot={{ r: 7, fill: "#ffffff", stroke: themeColors.stroke, strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={handleDownloadCSV}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 text-xs flex items-center space-x-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export 30-Day CSV Log</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
