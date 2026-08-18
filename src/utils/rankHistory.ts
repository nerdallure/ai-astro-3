import { TrackedKeyword, KeywordRankHistory } from "../types";

export interface ExtendedRankHistoryPoint {
  date: string; // e.g. "Jul 15"
  fullDate: string; // e.g. "2026-07-15"
  dayIndex: number; // 0 to 29
  rank: number; // integer rank, e.g. 1 to 100
  previousRank: number | null;
  change: number; // positive = gained positions (+3), negative = dropped (-2)
  isPeak: boolean;
  isLowest: boolean;
  statusTag: "Top 1" | "Top 3" | "Top 10" | "Top 20" | "Top 50" | "Unranked";
}

// Simple hash for deterministic pseudo-random numbers based on keyword id/string
function stringHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Generates or normalizes a complete 30-day historical rank trajectory for a keyword.
 * Preserves actual recorded history points while realistically populating all 30 days.
 */
export function get30DayRankHistory(
  keyword: TrackedKeyword,
  daysCount: number = 30
): ExtendedRankHistoryPoint[] {
  const currentRank = keyword.currentRank !== null ? keyword.currentRank : 50;
  const hashSeed = stringHash(keyword.id + keyword.keyword);

  const today = new Date("2026-08-11"); // Anchor date matching environment
  const points: ExtendedRankHistoryPoint[] = [];

  // 1. Build initial raw ranks array for 30 days
  const rawRanks: number[] = new Array(daysCount);

  // Set today's rank (index daysCount - 1)
  rawRanks[daysCount - 1] = currentRank;

  // Use existing history if available for recent days
  const existingHistory = keyword.history || [];
  if (existingHistory.length > 0) {
    const existingLen = existingHistory.length;
    for (let i = 0; i < Math.min(existingLen, daysCount); i++) {
      const existingPoint = existingHistory[existingLen - 1 - i];
      const targetIdx = daysCount - 1 - i;
      if (targetIdx >= 0 && existingPoint && typeof existingPoint.rank === "number") {
        rawRanks[targetIdx] = existingPoint.rank;
      }
    }
  }

  // Backfill remaining days using a realistic random walk centered around currentRank
  let lastKnownRank = rawRanks[daysCount - 1];
  for (let i = daysCount - 1; i >= 0; i--) {
    if (rawRanks[i] !== undefined) {
      lastKnownRank = rawRanks[i];
    } else {
      // Pseudo-random walk step (-2 to +2 positions)
      const pseudoRand = ((hashSeed * (i + 13) * 9301 + 49297) % 233280) / 233280;
      let step = 0;
      if (pseudoRand < 0.3) step = -1;
      else if (pseudoRand < 0.5) step = -2;
      else if (pseudoRand < 0.7) step = 1;
      else if (pseudoRand < 0.85) step = 2;

      // Keep within realistic bounds (1 to 60)
      const calculatedRank = Math.max(1, Math.min(60, lastKnownRank + step));
      rawRanks[i] = calculatedRank;
      lastKnownRank = calculatedRank;
    }
  }

  // Find peak (min number) and lowest (max number)
  const minRank = Math.min(...rawRanks);
  const maxRank = Math.max(...rawRanks);

  // 2. Format detailed points
  for (let i = 0; i < daysCount; i++) {
    const pointDate = new Date(today);
    pointDate.setDate(today.getDate() - (daysCount - 1 - i));

    const dateStr = pointDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const fullDateStr = pointDate.toISOString().split("T")[0];

    const r = rawRanks[i];
    const prevR = i > 0 ? rawRanks[i - 1] : null;
    const change = prevR !== null ? prevR - r : 0; // Positive means rank improved (e.g. from #5 to #2 is +3)

    let statusTag: ExtendedRankHistoryPoint["statusTag"] = "Top 50";
    if (r === 1) statusTag = "Top 1";
    else if (r <= 3) statusTag = "Top 3";
    else if (r <= 10) statusTag = "Top 10";
    else if (r <= 20) statusTag = "Top 20";
    else if (r > 50) statusTag = "Unranked";

    points.push({
      date: dateStr,
      fullDate: fullDateStr,
      dayIndex: i,
      rank: r,
      previousRank: prevR,
      change,
      isPeak: r === minRank,
      isLowest: r === maxRank,
      statusTag,
    });
  }

  return points;
}

/**
 * Calculates 30-day analytics summary for a keyword
 */
export function get30DayRankAnalytics(points: ExtendedRankHistoryPoint[]) {
  if (!points || points.length === 0) {
    return {
      bestRank: null,
      worstRank: null,
      avgRank: null,
      netChange: 0,
      volatility: "N/A",
      top3Percentage: 0,
      top10Percentage: 0,
    };
  }

  const ranks = points.map((p) => p.rank);
  const bestRank = Math.min(...ranks);
  const worstRank = Math.max(...ranks);
  const sumRanks = ranks.reduce((acc, r) => acc + r, 0);
  const avgRank = Number((sumRanks / ranks.length).toFixed(1));

  const firstPoint = points[0].rank;
  const lastPoint = points[points.length - 1].rank;
  const netChange = firstPoint - lastPoint; // positive = gained rank

  // Standard deviation for volatility
  const variance =
    ranks.reduce((acc, r) => acc + Math.pow(r - avgRank, 2), 0) / ranks.length;
  const stdDev = Math.sqrt(variance);

  let volatility = "Low (Stable)";
  if (stdDev > 4) volatility = "High (Fluctuating)";
  else if (stdDev > 2) volatility = "Moderate";

  const top3Days = points.filter((p) => p.rank <= 3).length;
  const top10Days = points.filter((p) => p.rank <= 10).length;

  const top3Percentage = Math.round((top3Days / points.length) * 100);
  const top10Percentage = Math.round((top10Days / points.length) * 100);

  return {
    bestRank,
    worstRank,
    avgRank,
    netChange,
    volatility,
    volatilityScore: Number(stdDev.toFixed(1)),
    top3Percentage,
    top10Percentage,
  };
}
