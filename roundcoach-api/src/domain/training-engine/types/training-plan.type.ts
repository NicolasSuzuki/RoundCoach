import {
  TrainingIntensity,
  TrainingPriority,
  TrainingTrend,
} from './training-diagnosis.type';

export interface DailyTrainingPlan {
  warmup: string[];
  inGame: string[];
  review: string[];
}

export interface WeeklyFocusPlan {
  title: string;
  goals: string[];
}

export interface TrainingRecommendation {
  focusArea: string;
  priority: TrainingPriority;
  trend: TrainingTrend;
  intensity: TrainingIntensity;
  dailyTrainingPlan: DailyTrainingPlan;
  weeklyFocusPlan: WeeklyFocusPlan;
  microGoal: string;
  justification: string;
}

export interface ResolvedTrainingPlan extends TrainingRecommendation {
  mainWeakness: string;
  mainStrength: string;
  generatedFromRange: string;
  sampleSize: number;
  isOnboarding: boolean;
}

export interface PersistedTrainingPlan extends ResolvedTrainingPlan {
  id: string;
  userId: string;
  status: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}
