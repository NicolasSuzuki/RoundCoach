import { TrainingRecommendationService } from './training-recommendation.service';
import { TrainingDiagnosis } from './types/training-diagnosis.type';
import { TrainingProfileInput } from './types/training-input.type';

describe('TrainingRecommendationService', () => {
  const service = new TrainingRecommendationService();

  const baseProfile: TrainingProfileInput = {
    userId: 'user-1',
    currentRank: 'Diamond 2',
    targetRank: 'Ascendant 1',
    currentGoal: 'Subir com mais controle de round',
    mainAgents: ['Killjoy'],
    mainRole: 'Sentinel',
    currentFocus: 'Melhorar setup e util',
  };

  it('should generate positioning-focused training', () => {
    const recommendation = service.recommend(
      baseProfile,
      buildDiagnosis('improve_positioning', 'positioning'),
    );

    expect(recommendation.dailyTrainingPlan.warmup.join(' ')).toContain('pre-aim');
    expect(recommendation.dailyTrainingPlan.inGame.join(' ')).toContain('reposicione');
  });

  it('should generate utility-focused training', () => {
    const recommendation = service.recommend(
      baseProfile,
      buildDiagnosis('improve_utility_usage', 'utility'),
    );

    expect(recommendation.dailyTrainingPlan.inGame.join(' ')).toContain('util');
    expect(recommendation.weeklyFocusPlan.title.toLowerCase()).toContain('utilidade');
  });

  it('should generate a crosshair micro goal', () => {
    const recommendation = service.recommend(
      baseProfile,
      buildDiagnosis('improve_crosshair_discipline', 'crosshair'),
    );

    expect(recommendation.microGoal.toLowerCase()).toContain('mira');
    expect(recommendation.microGoal.toLowerCase()).toContain('altura');
  });

  it('should adjust output by profile role', () => {
    const recommendation = service.recommend(
      {
        ...baseProfile,
        mainRole: 'Duelist',
      },
      buildDiagnosis('avoid_first_death', 'survival'),
    );

    expect(recommendation.microGoal.toLowerCase()).toContain('trade');
  });
});

function buildDiagnosis(
  priority: TrainingDiagnosis['priority'],
  focusArea: TrainingDiagnosis['focusArea'],
): TrainingDiagnosis {
  return {
    sampleSize: 5,
    metrics: {
      overallScoreAverage: 62,
      positioningScoreAverage: 58,
      utilityUsageScoreAverage: 63,
      crosshairScoreAverage: 66,
      firstDeathRate: 3.4,
      entryKillRate: 4.1,
    },
    mainWeakness: focusArea,
    mainStrength: 'crosshair',
    focusArea,
    priority,
    trend: 'stable',
    intensity: 'medium',
    generatedFromRange: 'last_5_completed_matches',
    isOnboarding: false,
  };
}
