import { AnalysisMetricKey } from '../../scoring/scoring-engine';

export type TrainingTrend = 'improving' | 'stable' | 'declining';
export type TrainingIntensity = 'low' | 'medium' | 'high';
export type TrainingPriority =
  | 'avoid_first_death'
  | 'improve_positioning'
  | 'improve_utility_usage'
  | 'improve_crosshair_discipline'
  | 'improve_consistency';

export interface TrainingMetricsSnapshot {
  overallScoreAverage: number;
  positioningScoreAverage: number;
  utilityUsageScoreAverage: number;
  crosshairScoreAverage: number;
  firstDeathRate: number;
  entryKillRate: number;
}

export interface TrainingDiagnosis {
  sampleSize: number;
  metrics: TrainingMetricsSnapshot;
  mainWeakness: AnalysisMetricKey | 'consistency' | 'survival';
  mainStrength: AnalysisMetricKey | 'consistency' | 'baseline' | 'role_identity';
  focusArea: AnalysisMetricKey | 'consistency' | 'survival';
  priority: TrainingPriority;
  trend: TrainingTrend;
  intensity: TrainingIntensity;
  generatedFromRange: string;
  isOnboarding: boolean;
}
