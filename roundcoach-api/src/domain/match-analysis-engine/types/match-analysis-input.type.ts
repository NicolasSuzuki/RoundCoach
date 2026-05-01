import { MatchResult } from '@prisma/client';

export interface MatchScoreboardPlayerInput {
  isCurrentUser?: boolean;
  kills: number;
  deaths: number;
  assists: number;
  acs: number;
  adr?: number | null;
  headshotPercentage?: number | null;
  firstKills: number;
  firstDeaths: number;
  multiKills: number;
}

export interface MatchAnalysisInput {
  result: MatchResult;
  score: string;
  player?: MatchScoreboardPlayerInput;
  lobbyPlayers?: MatchScoreboardPlayerInput[];
}

export interface MatchAnalysisResult {
  deathsFirst: number;
  entryKills: number;
  avgCrosshairScore: number;
  utilityUsageScore: number;
  positioningScore: number;
}
