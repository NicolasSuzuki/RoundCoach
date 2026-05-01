import { Injectable } from '@nestjs/common';
import { AnalysisMetricKey } from '../scoring/scoring-engine';
import { resolveFocusArea } from './rules/focus-area.rules';
import { calculateTrainingTrend } from './rules/trend.rules';
import { TrainingDiagnosis } from './types/training-diagnosis.type';
import { TrainingEngineInput } from './types/training-input.type';

@Injectable()
export class TrainingDiagnosisService {
  diagnose(input: TrainingEngineInput): TrainingDiagnosis {
    if (input.analyses.length < 3) {
      return this.buildOnboardingDiagnosis(input);
    }

    const ordered = [...input.analyses].sort(
      (left, right) => left.matchDate.getTime() - right.matchDate.getTime(),
    );
    const metricAverages = this.calculateMetricAverages(ordered);
    const overallScoreAverage = Math.round(
      ordered.reduce((total, analysis) => total + analysis.overallScore, 0) /
        ordered.length,
    );
    const firstDeathRate = Number(
      (
        ordered.reduce((total, analysis) => total + analysis.deathsFirst, 0) /
        ordered.length
      ).toFixed(1),
    );
    const entryKillRate = Number(
      (
        ordered.reduce((total, analysis) => total + analysis.entryKills, 0) /
        ordered.length
      ).toFixed(1),
    );
    const trend = calculateTrainingTrend(ordered.map((analysis) => analysis.overallScore));
    const resolvedFocus = resolveFocusArea({
      metricAverages,
      overallScoreAverage,
      firstDeathRate,
      trend,
      sampleSize: ordered.length,
    });

    return {
      sampleSize: ordered.length,
      metrics: {
        overallScoreAverage,
        positioningScoreAverage: metricAverages.positioning,
        utilityUsageScoreAverage: metricAverages.utility,
        crosshairScoreAverage: metricAverages.crosshair,
        firstDeathRate,
        entryKillRate,
      },
      ...resolvedFocus,
      trend,
      generatedFromRange: `last_${ordered.length}_completed_matches`,
      isOnboarding: false,
    };
  }

  private buildOnboardingDiagnosis(input: TrainingEngineInput): TrainingDiagnosis {
    const focusFromProfile = input.profile.currentFocus?.toLowerCase() ?? '';
    const hasUtilityFocus = focusFromProfile.includes('util');
    const hasCrosshairFocus =
      focusFromProfile.includes('crosshair') || focusFromProfile.includes('mira');
    const hasSurvivalFocus =
      focusFromProfile.includes('first death') ||
      focusFromProfile.includes('sobreviv');

    const focusArea = hasUtilityFocus
      ? 'utility'
      : hasCrosshairFocus
        ? 'crosshair'
        : hasSurvivalFocus
          ? 'survival'
          : 'consistency';

    const priority =
      focusArea === 'utility'
        ? 'improve_utility_usage'
        : focusArea === 'crosshair'
          ? 'improve_crosshair_discipline'
          : focusArea === 'survival'
            ? 'avoid_first_death'
            : 'improve_consistency';

    return {
      sampleSize: input.analyses.length,
      metrics: {
        overallScoreAverage: 0,
        positioningScoreAverage: 0,
        utilityUsageScoreAverage: 0,
        crosshairScoreAverage: 0,
        firstDeathRate: 0,
        entryKillRate: 0,
      },
      mainWeakness: focusArea,
      mainStrength: input.profile.mainRole ? 'role_identity' : 'baseline',
      focusArea,
      priority,
      trend: 'stable',
      intensity: 'low',
      generatedFromRange: 'onboarding',
      isOnboarding: true,
    };
  }

  private calculateMetricAverages(
    analyses: TrainingEngineInput['analyses'],
  ): Record<AnalysisMetricKey, number> {
    const totals: Record<AnalysisMetricKey, number> = {
      positioning: 0,
      utility: 0,
      crosshair: 0,
      survival: 0,
      entry: 0,
    };

    analyses.forEach((analysis) => {
      (Object.keys(totals) as AnalysisMetricKey[]).forEach((key) => {
        totals[key] += analysis.metricScores[key];
      });
    });

    return (Object.keys(totals) as AnalysisMetricKey[]).reduce(
      (accumulator, key) => {
        accumulator[key] = Math.round(totals[key] / analyses.length);
        return accumulator;
      },
      {} as Record<AnalysisMetricKey, number>,
    );
  }
}
