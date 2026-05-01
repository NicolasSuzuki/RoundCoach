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
  externalSource?: string | null;
  externalId?: string | null;
  scoreboardPlayers?: MatchScoreboardPlayer[];
  createdAt: string;
  updatedAt: string;
}

export interface MatchScoreboardPlayer {
  id: string;
  puuid?: string | null;
  isCurrentUser: boolean;
  gameName: string;
  tagLine?: string | null;
  teamId: string;
  agent: string;
  competitiveTier?: number | null;
  kills: number;
  deaths: number;
  assists: number;
  score: number;
  acs: number;
  adr?: number | null;
  headshotPercentage?: number | null;
  kastPercentage?: number | null;
  firstKills: number;
  firstDeaths: number;
  multiKills: number;
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
