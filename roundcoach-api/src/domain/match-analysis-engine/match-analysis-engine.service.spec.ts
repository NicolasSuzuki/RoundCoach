import { MatchResult } from '@prisma/client';
import { MatchAnalysisEngineService } from './match-analysis-engine.service';

describe('MatchAnalysisEngineService', () => {
  const service = new MatchAnalysisEngineService();

  it('preserves zero first deaths from the scoreboard', () => {
    const result = service.analyze({
      result: MatchResult.WIN,
      score: '13-6',
      player: {
        kills: 19,
        deaths: 10,
        assists: 9,
        acs: 298,
        adr: 212.5,
        headshotPercentage: 26,
        firstKills: 1,
        firstDeaths: 0,
        multiKills: 4,
      },
    });

    expect(result.deathsFirst).toBe(0);
    expect(result.entryKills).toBe(1);
  });

  it('rewards players performing above the lobby baseline', () => {
    const strongPlayer = {
      kills: 23,
      deaths: 11,
      assists: 7,
      acs: 310,
      adr: 205,
      headshotPercentage: 28,
      firstKills: 4,
      firstDeaths: 1,
      multiKills: 5,
    };
    const weakPlayer = {
      kills: 8,
      deaths: 18,
      assists: 3,
      acs: 120,
      adr: 82,
      headshotPercentage: 12,
      firstKills: 0,
      firstDeaths: 5,
      multiKills: 0,
    };

    const strongResult = service.analyze({
      result: MatchResult.WIN,
      score: '13-8',
      player: strongPlayer,
      lobbyPlayers: [strongPlayer, weakPlayer],
    });
    const weakResult = service.analyze({
      result: MatchResult.LOSS,
      score: '8-13',
      player: weakPlayer,
      lobbyPlayers: [strongPlayer, weakPlayer],
    });

    expect(strongResult.avgCrosshairScore).toBeGreaterThan(
      weakResult.avgCrosshairScore,
    );
    expect(strongResult.positioningScore).toBeGreaterThan(
      weakResult.positioningScore,
    );
  });
});
