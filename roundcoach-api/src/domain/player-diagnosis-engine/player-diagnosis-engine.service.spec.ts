import { PlayerDiagnosisEngineService } from './player-diagnosis-engine.service';
import { PlayerDiagnosisMatchInput } from './types/player-diagnosis-input.type';

describe('PlayerDiagnosisEngineService', () => {
  const service = new PlayerDiagnosisEngineService();

  it('uses competitive imported matches and keeps manual matches without queue', () => {
    const diagnosis = service.diagnose([
      buildMatch({ matchId: 'competitive-1', queueId: 'competitive', score: 80 }),
      buildMatch({ matchId: 'unrated-1', queueId: 'unrated', score: 20 }),
      buildMatch({ matchId: 'manual-1', queueId: null, score: 70 }),
    ]);

    expect(diagnosis.sampleSize).toBe(2);
    expect(diagnosis.averageScore).toBe(75);
  });

  it('prioritizes the weakest recurring recent metric', () => {
    const diagnosis = service.diagnose([
      buildMatch({
        matchId: 'recent-1',
        score: 76,
        metricScores: { entry: 30, survival: 80, crosshair: 78, utility: 74, positioning: 72 },
      }),
      buildMatch({
        matchId: 'recent-2',
        score: 74,
        metricScores: { entry: 35, survival: 82, crosshair: 76, utility: 70, positioning: 74 },
      }),
      buildMatch({
        matchId: 'recent-3',
        score: 72,
        metricScores: { entry: 33, survival: 79, crosshair: 75, utility: 72, positioning: 73 },
      }),
    ]);

    expect(diagnosis.weeklyWeakness).toBe('entry');
    expect(diagnosis.focusSuggestion).toBe('convert_opening_duels');
  });
});

function buildMatch(
  overrides: Partial<PlayerDiagnosisMatchInput> & { matchId: string },
): PlayerDiagnosisMatchInput {
  return {
    matchId: overrides.matchId,
    matchDate: overrides.matchDate ?? new Date(),
    score: overrides.score ?? 70,
    queueId: overrides.queueId,
    metricScores: overrides.metricScores ?? {
      positioning: 70,
      utility: 70,
      crosshair: 70,
      survival: 70,
      entry: 70,
    },
    currentPlayer: overrides.currentPlayer ?? {
      kills: 15,
      deaths: 12,
      assists: 5,
      acs: 220,
      adr: 150,
      firstKills: 2,
      firstDeaths: 1,
    },
  };
}
