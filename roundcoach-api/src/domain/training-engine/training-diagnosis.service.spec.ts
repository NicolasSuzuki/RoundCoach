import { TrainingDiagnosisService } from './training-diagnosis.service';
import { TrainingEngineInput } from './types/training-input.type';

describe('TrainingDiagnosisService', () => {
  const service = new TrainingDiagnosisService();

  const baseProfile: TrainingEngineInput['profile'] = {
    userId: 'user-1',
    currentRank: 'Diamond 1',
    targetRank: 'Ascendant 1',
    currentGoal: 'Subir com mais consistencia',
    mainAgents: ['Jett'],
    mainRole: 'Duelist',
    currentFocus: null,
  };

  it('should use the lowest average score as the main weakness', () => {
    const diagnosis = service.diagnose({
      profile: baseProfile,
      analyses: [
        buildAnalysis({ positioning: 52, utility: 70, crosshair: 77, deathsFirst: 2, entryKills: 8 }),
        buildAnalysis({ positioning: 55, utility: 68, crosshair: 74, deathsFirst: 2, entryKills: 8 }),
        buildAnalysis({ positioning: 50, utility: 71, crosshair: 79, deathsFirst: 2, entryKills: 7 }),
      ],
    });

    expect(diagnosis.mainWeakness).toBe('positioning');
    expect(diagnosis.priority).toBe('improve_positioning');
  });

  it('should use the highest average score as the main strength', () => {
    const diagnosis = service.diagnose({
      profile: baseProfile,
      analyses: [
        buildAnalysis({ positioning: 60, utility: 64, crosshair: 82, deathsFirst: 2, entryKills: 4 }),
        buildAnalysis({ positioning: 61, utility: 66, crosshair: 84, deathsFirst: 2, entryKills: 5 }),
        buildAnalysis({ positioning: 59, utility: 63, crosshair: 81, deathsFirst: 2, entryKills: 4 }),
      ],
    });

    expect(diagnosis.mainStrength).toBe('crosshair');
  });

  it('should prioritize avoiding first death when first death rate is critical', () => {
    const diagnosis = service.diagnose({
      profile: baseProfile,
      analyses: [
        buildAnalysis({ positioning: 60, utility: 66, crosshair: 71, deathsFirst: 5, entryKills: 4 }),
        buildAnalysis({ positioning: 62, utility: 67, crosshair: 73, deathsFirst: 4, entryKills: 4 }),
        buildAnalysis({ positioning: 61, utility: 65, crosshair: 72, deathsFirst: 5, entryKills: 3 }),
      ],
    });

    expect(diagnosis.priority).toBe('avoid_first_death');
    expect(diagnosis.focusArea).toBe('survival');
  });

  it('should calculate trend correctly', () => {
    const diagnosis = service.diagnose({
      profile: baseProfile,
      analyses: [
        buildAnalysis({ overallScore: 52, positioning: 55, utility: 58, crosshair: 60, deathsFirst: 3, entryKills: 3, matchDate: new Date('2026-03-20') }),
        buildAnalysis({ overallScore: 54, positioning: 56, utility: 59, crosshair: 61, deathsFirst: 3, entryKills: 3, matchDate: new Date('2026-03-21') }),
        buildAnalysis({ overallScore: 66, positioning: 68, utility: 67, crosshair: 69, deathsFirst: 2, entryKills: 4, matchDate: new Date('2026-03-22') }),
        buildAnalysis({ overallScore: 70, positioning: 71, utility: 70, crosshair: 72, deathsFirst: 2, entryKills: 5, matchDate: new Date('2026-03-23') }),
        buildAnalysis({ overallScore: 74, positioning: 73, utility: 72, crosshair: 75, deathsFirst: 2, entryKills: 5, matchDate: new Date('2026-03-24') }),
      ],
    });

    expect(diagnosis.trend).toBe('improving');
  });
});

function buildAnalysis(input: {
  overallScore?: number;
  positioning: number;
  utility: number;
  crosshair: number;
  deathsFirst: number;
  entryKills: number;
  matchDate?: Date;
}) {
  return {
    analysisId: 'analysis-1',
    matchId: 'match-1',
    matchDate: input.matchDate ?? new Date('2026-03-24T20:00:00.000Z'),
    deathsFirst: input.deathsFirst,
    entryKills: input.entryKills,
    avgCrosshairScore: input.crosshair,
    utilityUsageScore: input.utility,
    positioningScore: input.positioning,
    overallScore:
      input.overallScore ??
      Math.round(input.positioning * 0.28 + input.utility * 0.18 + input.crosshair * 0.28),
    metricScores: {
      positioning: input.positioning,
      utility: input.utility,
      crosshair: input.crosshair,
      survival: Math.max(0, 100 - input.deathsFirst * 11),
      entry: Math.min(100, input.entryKills * 8.5),
    },
  };
}
