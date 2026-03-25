import { MatchResult } from '@prisma/client';
import { simulateFakeAnalysis } from './fake-analysis-simulator';

describe('fake-analysis-simulator', () => {
  it('is reproducible for the same match payload', () => {
    const payload = {
      vodId: 'vod-1',
      matchId: 'match-1',
      userId: 'user-1',
      map: 'Ascent',
      agent: 'Jett',
      result: MatchResult.WIN,
      score: '13-10',
    };

    expect(simulateFakeAnalysis(payload)).toEqual(simulateFakeAnalysis(payload));
  });

  it('varies output when agent and result change', () => {
    const duelistWin = simulateFakeAnalysis({
      vodId: 'vod-1',
      matchId: 'match-1',
      userId: 'user-1',
      map: 'Ascent',
      agent: 'Jett',
      result: MatchResult.WIN,
      score: '13-10',
    });
    const sentinelLoss = simulateFakeAnalysis({
      vodId: 'vod-1',
      matchId: 'match-1',
      userId: 'user-1',
      map: 'Split',
      agent: 'Cypher',
      result: MatchResult.LOSS,
      score: '8-13',
    });

    expect(duelistWin.entryKills).toBeGreaterThanOrEqual(sentinelLoss.entryKills);
    expect(duelistWin.crosshairScore).not.toBe(sentinelLoss.crosshairScore);
  });
});
