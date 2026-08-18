import { TrackedKeyword } from "../types";

export interface DataPoint {
  dayIndex: number;
  label: string;
  actual?: number;
  fitted?: number;
  forecast?: number;
  forecastUpper?: number;
  forecastLower?: number;
}

export interface RegressionResult {
  slope: number;
  intercept: number;
  rSquared: number;
  currentPopularity: number;
  projectedPopularity30D: number;
  popularityChange30D: number;
  percentChange30D: number;
  trendLabel: "Strong Growth Momentum" | "Moderate Upward Trend" | "Stable / Flat Demand" | "Slight Downward Drift" | "Sharp Search Volume Decay";
  confidenceLevel: "High" | "Moderate" | "Low";
  chartData: DataPoint[];
}

/**
 * Generates historical popularity points for a keyword based on its current popularity score,
 * rank history trends, and deterministic seeds.
 */
export function getKeywordPopularityHistory(
  keyword: TrackedKeyword,
  daysPast: number = 14
): { dayIndex: number; label: string; value: number }[] {
  const currentPop = keyword.popularity;
  const history = keyword.history || [];

  // Deterministic seed from keyword id
  let hash = 0;
  for (let i = 0; i < keyword.id.length; i++) {
    hash = (hash << 5) - hash + keyword.id.charCodeAt(i);
    hash |= 0;
  }

  // Use historical rank trajectory as a hint for popularity direction if available
  const rankDelta =
    history.length >= 2
      ? history[0].rank - history[history.length - 1].rank // positive if improved rank
      : keyword.previousRank && keyword.currentRank
      ? keyword.previousRank - keyword.currentRank
      : 0;

  const points: { dayIndex: number; label: string; value: number }[] = [];
  const today = new Date();

  for (let i = daysPast - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateLabel = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    if (i === 0) {
      points.push({ dayIndex: daysPast - 1 - i, label: dateLabel, value: currentPop });
    } else {
      // Simulate historical popularity backwards from today
      const progressFraction = (daysPast - 1 - i) / (daysPast - 1); // 0 to 1
      const trendBias = (rankDelta * 0.4) * (1 - progressFraction);
      const waveNoise = Math.sin(hash + i * 1.3) * 2.5 + Math.cos(i * 0.9) * 1.5;
      
      const val = Math.round(currentPop - trendBias + waveNoise);
      const clamped = Math.max(1, Math.min(100, val));
      points.push({ dayIndex: daysPast - 1 - i, label: dateLabel, value: clamped });
    }
  }

  return points;
}

/**
 * Calculates Ordinary Least Squares (OLS) Linear Regression over historical data
 * and computes a 30-day forecast.
 */
export function calculateKeywordRegression(
  keyword: TrackedKeyword,
  daysPast: number = 14,
  forecastDays: number = 30
): RegressionResult {
  const historical = getKeywordPopularityHistory(keyword, daysPast);
  const n = historical.length;

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  let sumY2 = 0;

  historical.forEach((pt) => {
    sumX += pt.dayIndex;
    sumY += pt.value;
    sumXY += pt.dayIndex * pt.value;
    sumX2 += pt.dayIndex * pt.dayIndex;
    sumY2 += pt.value * pt.value;
  });

  const meanX = sumX / n;
  const meanY = sumY / n;

  const denominator = n * sumX2 - sumX * sumX;
  const slope = denominator !== 0 ? (n * sumXY - sumX * sumY) / denominator : 0;
  const intercept = meanY - slope * meanX;

  // Calculate R-Squared (R^2)
  let ssTot = 0;
  let ssRes = 0;
  historical.forEach((pt) => {
    const fitted = slope * pt.dayIndex + intercept;
    ssTot += Math.pow(pt.value - meanY, 2);
    ssRes += Math.pow(pt.value - fitted, 2);
  });

  const rSquared = ssTot > 0 ? Math.max(0, Math.min(1, 1 - ssRes / ssTot)) : 0.8;

  // Forecast 30 days into the future
  const currentPop = keyword.popularity;
  const lastDayIndex = n - 1;
  const forecastEndIndex = lastDayIndex + forecastDays;

  const rawProjected30D = slope * forecastEndIndex + intercept;
  const projectedPopularity30D = Math.max(1, Math.min(100, Math.round(rawProjected30D)));
  const popularityChange30D = projectedPopularity30D - currentPop;
  const percentChange30D = currentPop > 0 ? Math.round((popularityChange30D / currentPop) * 100) : 0;

  // Trend categorization based on slope
  let trendLabel: RegressionResult["trendLabel"] = "Stable / Flat Demand";
  if (slope >= 0.25) {
    trendLabel = "Strong Growth Momentum";
  } else if (slope >= 0.05) {
    trendLabel = "Moderate Upward Trend";
  } else if (slope <= -0.25) {
    trendLabel = "Sharp Search Volume Decay";
  } else if (slope <= -0.05) {
    trendLabel = "Slight Downward Drift";
  }

  // Confidence based on R^2 and data consistency
  let confidenceLevel: RegressionResult["confidenceLevel"] = "Moderate";
  if (rSquared >= 0.65) {
    confidenceLevel = "High";
  } else if (rSquared < 0.25) {
    confidenceLevel = "Low";
  }

  // Build combined ChartData (Historical + Linear Fit + Future Forecast)
  const chartData: DataPoint[] = [];

  // 1. Historical points
  historical.forEach((pt) => {
    const fittedVal = Math.max(1, Math.min(100, Math.round(slope * pt.dayIndex + intercept)));
    chartData.push({
      dayIndex: pt.dayIndex,
      label: pt.label,
      actual: pt.value,
      fitted: fittedVal,
    });
  });

  // 2. Future forecast points (sampled every 5 days for clean display up to +30 days)
  const today = new Date();
  const step = 5;
  
  // Bridge point at current day
  chartData[chartData.length - 1].forecast = currentPop;
  chartData[chartData.length - 1].forecastUpper = currentPop;
  chartData[chartData.length - 1].forecastLower = currentPop;

  for (let f = step; f <= forecastDays; f += step) {
    const futureDayIndex = lastDayIndex + f;
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + f);
    const dateLabel = `+${f}d (${futureDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })})`;

    const predicted = Math.max(1, Math.min(100, Math.round(slope * futureDayIndex + intercept)));
    
    // Variance margin expands with distance into future
    const margin = Math.round(3 + (f / 30) * 8 * (1 - rSquared * 0.5));
    const upper = Math.min(100, predicted + margin);
    const lower = Math.max(1, predicted - margin);

    chartData.push({
      dayIndex: futureDayIndex,
      label: dateLabel,
      forecast: predicted,
      forecastUpper: upper,
      forecastLower: lower,
    });
  }

  return {
    slope: Math.round(slope * 100) / 100,
    intercept: Math.round(intercept * 100) / 100,
    rSquared: Math.round(rSquared * 100) / 100,
    currentPopularity: currentPop,
    projectedPopularity30D,
    popularityChange30D,
    percentChange30D,
    trendLabel,
    confidenceLevel,
    chartData,
  };
}
