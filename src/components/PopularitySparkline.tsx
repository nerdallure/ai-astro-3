import React, { useMemo } from "react";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";
import { KeywordRankHistory } from "../types";

interface PopularitySparklineProps {
  popularity: number;
  keywordId: string;
  history?: KeywordRankHistory[];
  width?: number;
  height?: number;
}

interface SparklineDataPoint {
  date: string;
  value: number;
}

// Generate deterministic trend points over 7 days ending at current popularity
function generatePopularityTrend(
  popularity: number,
  keywordId: string,
  history?: KeywordRankHistory[]
): SparklineDataPoint[] {
  const days = ["Aug 2", "Aug 3", "Aug 4", "Aug 5", "Aug 6", "Aug 7", "Aug 8"];

  // Simple string hash function for deterministic variation per keyword
  let hash = 0;
  for (let i = 0; i < keywordId.length; i++) {
    hash = (hash << 5) - hash + keywordId.charCodeAt(i);
    hash |= 0;
  }

  return days.map((day, idx) => {
    if (idx === days.length - 1) {
      return { date: "Today", value: popularity };
    }

    // Generate small, realistic fluctuation based on day offset and keyword hash
    const deltaSeed = Math.sin(hash + idx * 1.7) * 6 + Math.cos(idx * 2.3) * 3;
    const rawVal = Math.round(popularity + deltaSeed);
    const clampedVal = Math.max(5, Math.min(99, rawVal));

    return {
      date: day,
      value: clampedVal,
    };
  });
}

export const PopularitySparkline: React.FC<PopularitySparklineProps> = ({
  popularity,
  keywordId,
  history,
  width = 68,
  height = 24,
}) => {
  const data = useMemo(
    () => generatePopularityTrend(popularity, keywordId, history),
    [popularity, keywordId, history]
  );

  // Determine overall trend direction
  const firstVal = data[0].value;
  const lastVal = data[data.length - 1].value;
  const diff = lastVal - firstVal;

  const strokeColor = diff >= 0 ? "#fbbf24" : "#f43f5e"; // bright amber vs vibrant rose
  const gradientId = `popGrad-${keywordId.replace(/[^a-zA-Z0-9]/g, "_")}`;

  return (
    <div
      className="relative shrink-0 flex items-center"
      style={{ width: `${width}px`, height: `${height}px` }}
      title={`Popularity Trend: ${firstVal} → ${lastVal}`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity={0.4} />
              <stop offset="100%" stopColor={strokeColor} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <Tooltip
            isAnimationActive={false}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const pt = payload[0].payload as SparklineDataPoint;
                return (
                  <div className="bg-zinc-950 border border-zinc-700 px-2 py-1 rounded shadow-xl text-[10px] z-50 whitespace-nowrap">
                    <span className="text-zinc-400">{pt.date}: </span>
                    <span className="font-mono font-bold text-amber-300">{pt.value} Pop</span>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={strokeColor}
            strokeWidth={1.5}
            fill={`url(#${gradientId})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
