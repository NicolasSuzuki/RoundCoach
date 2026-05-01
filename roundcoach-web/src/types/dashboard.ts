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
  coachWritingSource: 'ai' | 'deterministic';
  observation: string;
  recommendedTraining: string[];
}
export interface DashboardEvolutionPoint {
  matchId: string;
  label: string;
  score: number;
  matchDate: string;
}
export interface DashboardDailyTrainingPlan {
  warmup: string[];
  inGame: string[];
  review: string[];
}
export interface DashboardWeeklyFocusPlan {
  title: string;
  goals: string[];
}
export interface DashboardTrainingPlan {
  focusArea: string;
  dailyTrainingPlan: DashboardDailyTrainingPlan;
  weeklyFocusPlan: DashboardWeeklyFocusPlan;
  microGoal: string;
  justification: string;
  trend: string;
  mainWeakness: string;
  mainStrength: string;
  intensity: string;
  isOnboarding: boolean;
  coachWritingSource: 'ai' | 'deterministic';
}
