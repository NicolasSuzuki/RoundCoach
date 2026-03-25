import { buildAnalysisInsights, calculateOverallScore } from './analysis-insights';

describe('analysis-insights', () => {
  it('builds a fragile openings scenario deterministically', () => {
    const insights = buildAnalysisInsights({
      deathsFirst: 7,
      entryKills: 4,
      avgCrosshairScore: 58,
      utilityUsageScore: 63,
      positioningScore: 56,
    });

    expect(insights.scenario).toBe('fragile_openings');
    expect(insights.weaknessKey).toBe('survival');
    expect(insights.focusSuggestion).toBe('avoid_first_death');
    expect(insights.summary).toContain('primeiro contato');
  });

  it('builds a good prep low conversion scenario deterministically', () => {
    const insights = buildAnalysisInsights({
      deathsFirst: 5,
      entryKills: 8,
      avgCrosshairScore: 60,
      utilityUsageScore: 78,
      positioningScore: 67,
    });

    expect(insights.scenario).toBe('good_prep_low_conversion');
    expect(insights.strengthKey).toBe('utility');
    expect(insights.summary).toContain('utilidade');
  });

  it('calculates overall score with the shared weights', () => {
    const score = calculateOverallScore({
      deathsFirst: 3,
      entryKills: 7,
      avgCrosshairScore: 74,
      utilityUsageScore: 68,
      positioningScore: 72,
    });

    expect(score).toBe(70);
  });
});
