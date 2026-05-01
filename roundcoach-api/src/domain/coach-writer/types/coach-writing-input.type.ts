import { PlayerDiagnosisResult } from '../../player-diagnosis-engine/types/player-diagnosis-input.type';
import { PersistedTrainingPlan } from '../../training-engine/types/training-plan.type';

export interface CoachWritingInput {
  diagnosis: PlayerDiagnosisResult;
  profile?: {
    currentRank?: string | null;
    currentGoal?: string | null;
    mainRole?: string | null;
    currentFocus?: string | null;
  } | null;
}

export interface CoachWritingResult {
  observation: string;
  recommendedTraining: string[];
  source: 'deterministic' | 'ai';
}

export interface TrainingPlanWritingInput {
  plan: PersistedTrainingPlan;
  profile?: {
    currentRank?: string | null;
    currentGoal?: string | null;
    mainAgents?: string[];
    mainRole?: string | null;
    currentFocus?: string | null;
  } | null;
}

export interface TrainingPlanWritingResult {
  weeklyFocusTitle: string;
  weeklyGoals: string[];
  justification: string;
  warmup: string[];
  inGame: string[];
  review: string[];
  microGoal: string;
  source: 'deterministic' | 'ai';
}
