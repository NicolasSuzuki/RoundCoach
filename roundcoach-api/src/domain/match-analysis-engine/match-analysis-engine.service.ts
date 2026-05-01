import { Injectable } from '@nestjs/common';
import { MatchResult } from '@prisma/client';
import {
  MatchAnalysisInput,
  MatchAnalysisResult,
  MatchScoreboardPlayerInput,
} from './types/match-analysis-input.type';

@Injectable()
export class MatchAnalysisEngineService {
  analyze(input: MatchAnalysisInput): MatchAnalysisResult {
    const player = input.player ?? this.buildFallbackPlayer(input);
    const lobby = input.lobbyPlayers?.length ? input.lobbyPlayers : [player];
    const lobbyAverage = this.calculateLobbyAverage(lobby);
    const won = input.result === MatchResult.WIN;
    const kdRatio = player.kills / Math.max(1, player.deaths);
    const kdDelta = player.kills - player.deaths;
    const adr = player.adr ?? player.acs * 0.68;
    const headshotPercentage = player.headshotPercentage ?? 18;
    const acsRelative = ratio(player.acs, lobbyAverage.acs);
    const adrRelative = ratio(adr, lobbyAverage.adr);

    return {
      deathsFirst: clampInt(player.firstDeaths, 0, 12),
      entryKills: clampInt(player.firstKills, 0, 18),
      avgCrosshairScore: clampScore(
        42 +
          acsRelative * 18 +
          headshotPercentage * 0.75 +
          kdDelta * 1.15 +
          adrRelative * 8,
      ),
      utilityUsageScore: clampScore(
        47 +
          player.assists * 4 +
          (won ? 5 : -2) +
          adrRelative * 8 +
          Math.min(8, player.multiKills * 0.8),
      ),
      positioningScore: clampScore(
        52 +
          kdRatio * 11 +
          adrRelative * 10 +
          (won ? 4 : -3) -
          player.firstDeaths * 4.5,
      ),
    };
  }

  private calculateLobbyAverage(players: MatchScoreboardPlayerInput[]) {
    const total = players.reduce(
      (accumulator, player) => {
        accumulator.acs += player.acs;
        accumulator.adr += player.adr ?? player.acs * 0.68;
        return accumulator;
      },
      { acs: 0, adr: 0 },
    );

    return {
      acs: total.acs / players.length,
      adr: total.adr / players.length,
    };
  }

  private buildFallbackPlayer(input: MatchAnalysisInput): MatchScoreboardPlayerInput {
    const { own, enemy } = parseScore(input.score, input.result);
    const won = input.result === MatchResult.WIN;

    return {
      kills: won ? 16 : 12,
      deaths: won ? 12 : 16,
      assists: 4,
      acs: won ? 220 : 175,
      adr: won ? 145 : 120,
      firstKills: won ? 2 : 1,
      firstDeaths: won ? 1 : 3,
      multiKills: Math.max(0, Math.round((own - enemy) / 3)),
    };
  }
}

function parseScore(score: string, result: MatchResult) {
  const matched = score.match(/(\d+)\s*-\s*(\d+)/);

  if (!matched) {
    return {
      own: result === MatchResult.WIN ? 13 : 9,
      enemy: result === MatchResult.WIN ? 9 : 13,
    };
  }

  const left = Number(matched[1]);
  const right = Number(matched[2]);

  return {
    own: result === MatchResult.WIN ? Math.max(left, right) : Math.min(left, right),
    enemy: result === MatchResult.WIN ? Math.min(left, right) : Math.max(left, right),
  };
}

function ratio(value: number, baseline: number) {
  return baseline > 0 ? value / baseline : 1;
}

function clampScore(value: number) {
  return Number(Math.max(35, Math.min(95, value)).toFixed(1));
}

function clampInt(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.round(value)));
}
