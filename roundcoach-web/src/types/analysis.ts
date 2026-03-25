export type AnalysisStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface AnalysisCoach {
  overallScore: number;
  scenario: string;
  strengthKey: string;
  strengthLabel: string;
  strengthText: string;
  weaknessKey: string;
  weaknessLabel: string;
  weaknessText: string;
  focusSuggestion: string;
  microGoal: string;
  recommendedTraining: string[];
}

export interface Analysis {
  id: string;
  matchId: string;
  vodId?: string | null;
  processingStatus: AnalysisStatus;
  deathsFirst?: number | null;
  entryKills?: number | null;
  avgCrosshairScore?: number | null;
  utilityUsageScore?: number | null;
  positioningScore?: number | null;
  summary?: string | null;
  overallScore?: number | null;
  coach?: AnalysisCoach | null;
  createdAt: string;
  updatedAt: string;
}

export interface VodProcessResponse {
  message: string;
  vod: import('./vod').Vod;
  analysis: Analysis;
}
