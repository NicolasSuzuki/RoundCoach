import { AnalysisMetricKey } from '../../scoring/scoring-engine';
import {
  TrainingDiagnosis,
  TrainingIntensity,
  TrainingPriority,
} from '../types/training-diagnosis.type';

interface FocusAreaInput {
  metricAverages: Record<AnalysisMetricKey, number>;
  overallScoreAverage: number;
  firstDeathRate: number;
  trend: TrainingDiagnosis['trend'];
  sampleSize: number;
}

export function resolveFocusArea(input: FocusAreaInput): Pick<
  TrainingDiagnosis,
  'mainWeakness' | 'mainStrength' | 'focusArea' | 'priority' | 'intensity'
> {
  const rankedMetrics = (
    Object.entries(input.metricAverages) as Array<[AnalysisMetricKey, number]>
  ).sort((left, right) => left[1] - right[1]);

  const mainWeakness = rankedMetrics[0]?.[0] ?? 'positioning';
  const mainStrength = rankedMetrics.at(-1)?.[0] ?? 'crosshair';
  const spread =
    rankedMetrics.at(-1)?.[1] != null && rankedMetrics[0] != null
      ? rankedMetrics.at(-1)![1] - rankedMetrics[0][1]
      : 0;

  let focusArea: TrainingDiagnosis['focusArea'] = mainWeakness;
  let priority = mapMetricToPriority(mainWeakness);

  if (input.firstDeathRate >= 4) {
    focusArea = 'survival';
    priority = 'avoid_first_death';
  } else if (mainWeakness === 'entry' || spread < 8) {
    focusArea = 'consistency';
    priority = 'improve_consistency';
  }

  const intensity = resolveIntensity({
    focusArea,
    overallScoreAverage: input.overallScoreAverage,
    weakestMetricScore: rankedMetrics[0]?.[1] ?? 0,
    firstDeathRate: input.firstDeathRate,
    trend: input.trend,
    sampleSize: input.sampleSize,
  });

  return {
    mainWeakness,
    mainStrength,
    focusArea,
    priority,
    intensity,
  };
}

function mapMetricToPriority(metric: AnalysisMetricKey): TrainingPriority {
  switch (metric) {
    case 'positioning':
      return 'improve_positioning';
    case 'utility':
      return 'improve_utility_usage';
    case 'crosshair':
      return 'improve_crosshair_discipline';
    case 'survival':
      return 'avoid_first_death';
    case 'entry':
      return 'improve_consistency';
  }
}

function resolveIntensity(input: {
  focusArea: string;
  overallScoreAverage: number;
  weakestMetricScore: number;
  firstDeathRate: number;
  trend: TrainingDiagnosis['trend'];
  sampleSize: number;
}): TrainingIntensity {
  if (input.sampleSize < 3) {
    return 'low';
  }

  if (
    input.focusArea === 'survival' ||
    input.firstDeathRate >= 4 ||
    input.weakestMetricScore < 55 ||
    input.trend === 'declining' ||
    input.overallScoreAverage < 58
  ) {
    return 'high';
  }

  if (input.weakestMetricScore < 68 || input.overallScoreAverage < 72) {
    return 'medium';
  }

  return 'low';
}
