import { AnalysisMetricKey } from '../../scoring/scoring-engine';

export interface PlayerDiagnosisMatchInput {
  matchId: string;
  matchDate: Date;
  score: number;
  metricScores: Record<AnalysisMetricKey, number>;
  queueId?: string | null;
  currentPlayer?: {
    kills: number;
    deaths: number;
    assists: number;
    acs: number;
    adr?: number | null;
    firstKills: number;
    firstDeaths: number;
  } | null;
}

export interface PlayerDiagnosisResult {
  sampleSize: number;
  averageScore: number;
  lastScore: number;
  bestScore: number;
  lastFiveAverageScore: number;
  trend: 'up' | 'down' | 'stable';
  consistency: 'high' | 'medium' | 'low';
  mainWeakness: AnalysisMetricKey | 'no_data';
  mainStrength: AnalysisMetricKey | 'no_data';
  weeklyWeakness: AnalysisMetricKey | 'no_data';
  recurringStrength: AnalysisMetricKey | 'no_data';
  focusSuggestion: string;
  observation: string;
  recommendedTraining: string[];
  evidence: string[];
}
