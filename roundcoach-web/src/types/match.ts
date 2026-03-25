import { PaginatedResponse } from './common';

export type MatchResult = 'WIN' | 'LOSS';

export interface Match {
  id: string;
  userId: string;
  map: string;
  agent: string;
  result: MatchResult;
  score: string;
  matchDate: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMatchPayload {
  map: string;
  agent: string;
  result: MatchResult;
  score: string;
  matchDate: string;
  notes?: string;
}

export type MatchesResponse = PaginatedResponse<Match>;
