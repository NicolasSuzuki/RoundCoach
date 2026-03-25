export interface DashboardSummary {
  totalAnalysedMatches: number;
  averageScore: number;
  lastScore: number;
  bestScore: number;
  lastFiveAverageScore: number;
  trend: 'up' | 'down' | 'stable';
  processedMatchRate: number;
  mainWeakness: string;
  mainStrength: string;
  focusSuggestion: string;
  weeklyWeakness: string;
  recurringStrength: string;
  profileCurrentRank?: string | null;
  profileCurrentGoal?: string | null;
  profileMainAgents: string[];
  profileMainRole?: string | null;
  profileCurrentFocus?: string | null;
  observation: string;
  recommendedTraining: string[];
}

export interface DashboardEvolutionPoint {
  matchId: string;
  label: string;
  score: number;
  matchDate: string;
}
