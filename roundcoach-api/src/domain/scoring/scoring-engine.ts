export type AnalysisMetricKey =
  | 'positioning'
  | 'utility'
  | 'crosshair'
  | 'survival'
  | 'entry';

export interface AnalysisMetricsInput {
  deathsFirst?: number | null;
  entryKills?: number | null;
  avgCrosshairScore?: number | null;
  utilityUsageScore?: number | null;
  positioningScore?: number | null;
}

const SCORE_WEIGHTS: Record<AnalysisMetricKey, number> = {
  positioning: 0.28,
  utility: 0.18,
  crosshair: 0.28,
  survival: 0.16,
  entry: 0.1,
};

export function extractAnalysisMetricScores(
  input: AnalysisMetricsInput,
): Record<AnalysisMetricKey, number> {
  return {
    positioning: clampScore(input.positioningScore ?? 0),
    utility: clampScore(input.utilityUsageScore ?? 0),
    crosshair: clampScore(input.avgCrosshairScore ?? 0),
    survival: clampScore(100 - (input.deathsFirst ?? 0) * 11),
    entry: clampScore((input.entryKills ?? 0) * 8.5),
  };
}

export function calculateOverallScore(input: AnalysisMetricsInput): number {
  const metricScores = extractAnalysisMetricScores(input);

  return Math.round(
    (Object.keys(SCORE_WEIGHTS) as AnalysisMetricKey[]).reduce(
      (total, key) => total + metricScores[key] * SCORE_WEIGHTS[key],
      0,
    ),
  );
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value * 10) / 10));
}
