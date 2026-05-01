import { AnalysisMetricKey } from '../../scoring/scoring-engine';

export interface TrainingProfileInput {
  userId: string;
  currentRank?: string | null;
  targetRank?: string | null;
  currentGoal?: string | null;
  mainAgents: string[];
  mainRole?: string | null;
  currentFocus?: string | null;
}

export interface RecentCompletedAnalysisInput {
  analysisId: string;
  matchId: string;
  matchDate: Date;
  deathsFirst: number;
  entryKills: number;
  avgCrosshairScore: number;
  utilityUsageScore: number;
  positioningScore: number;
  overallScore: number;
  metricScores: Record<AnalysisMetricKey, number>;
}

export interface TrainingEngineInput {
  profile: TrainingProfileInput;
  analyses: RecentCompletedAnalysisInput[];
}
