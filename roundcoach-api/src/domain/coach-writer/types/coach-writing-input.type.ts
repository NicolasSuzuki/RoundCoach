import { PlayerDiagnosisResult } from '../../player-diagnosis-engine/types/player-diagnosis-input.type';

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
