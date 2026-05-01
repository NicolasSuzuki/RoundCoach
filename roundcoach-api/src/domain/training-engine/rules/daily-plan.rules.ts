import { DAILY_PLAN_TEMPLATES, WEEKLY_PLAN_TEMPLATES } from '../templates/training-templates';
import { TrainingDiagnosis, TrainingPriority } from '../types/training-diagnosis.type';
import { TrainingProfileInput } from '../types/training-input.type';
import { DailyTrainingPlan, WeeklyFocusPlan } from '../types/training-plan.type';

export function buildDailyTrainingPlan(
  priority: TrainingPriority,
  profile: TrainingProfileInput,
  diagnosis: TrainingDiagnosis,
): DailyTrainingPlan {
  const template = DAILY_PLAN_TEMPLATES[priority];

  return {
    warmup: template.warmup.map((item) =>
      applyProfileAdjustments(item, profile, diagnosis),
    ),
    inGame: template.inGame.map((item) =>
      applyProfileAdjustments(item, profile, diagnosis),
    ),
    review: template.review.map((item) =>
      applyProfileAdjustments(item, profile, diagnosis),
    ),
  };
}

export function buildWeeklyFocusPlan(
  priority: TrainingPriority,
  profile: TrainingProfileInput,
  diagnosis: TrainingDiagnosis,
): WeeklyFocusPlan {
  const template = WEEKLY_PLAN_TEMPLATES[priority];

  return {
    title: applyProfileAdjustments(template.title, profile, diagnosis),
    goals: template.goals.map((item) =>
      applyProfileAdjustments(item, profile, diagnosis),
    ),
  };
}

function applyProfileAdjustments(
  value: string,
  profile: TrainingProfileInput,
  diagnosis: TrainingDiagnosis,
): string {
  let result = value;

  result = result.replace('{role}', profile.mainRole?.toLowerCase() ?? 'sua role');
  result = result.replace(
    '{agents}',
    profile.mainAgents.length > 0 ? profile.mainAgents.join(', ') : 'seus agentes principais',
  );
  result = result.replace('{currentRank}', profile.currentRank ?? 'seu elo atual');
  result = result.replace('{targetRank}', profile.targetRank ?? 'seu proximo objetivo');

  return result.replace('{intensity}', diagnosis.intensity);
}
