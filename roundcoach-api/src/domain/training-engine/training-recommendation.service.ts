import { Injectable } from '@nestjs/common';
import { buildDailyTrainingPlan, buildWeeklyFocusPlan } from './rules/daily-plan.rules';
import { buildMicroGoal } from './rules/micro-goal.rules';
import { TrainingDiagnosis } from './types/training-diagnosis.type';
import { TrainingProfileInput } from './types/training-input.type';
import { TrainingRecommendation } from './types/training-plan.type';

@Injectable()
export class TrainingRecommendationService {
  recommend(
    profile: TrainingProfileInput,
    diagnosis: TrainingDiagnosis,
  ): TrainingRecommendation {
    const dailyTrainingPlan = buildDailyTrainingPlan(
      diagnosis.priority,
      profile,
      diagnosis,
    );
    const weeklyFocusPlan = buildWeeklyFocusPlan(
      diagnosis.priority,
      profile,
      diagnosis,
    );
    const microGoal = buildMicroGoal(diagnosis.priority, profile);

    return {
      focusArea: diagnosis.focusArea,
      priority: diagnosis.priority,
      trend: diagnosis.trend,
      intensity: diagnosis.intensity,
      dailyTrainingPlan,
      weeklyFocusPlan,
      microGoal,
      justification: this.buildJustification(profile, diagnosis),
    };
  }

  private buildJustification(
    profile: TrainingProfileInput,
    diagnosis: TrainingDiagnosis,
  ): string {
    if (diagnosis.isOnboarding) {
      return 'Ainda ha pouco historico concluido, entao o plano atual prioriza base, repeticao e leitura simples. Conforme novas partidas forem analisadas, o treino fica mais especifico e mais forte.';
    }

    const rankLead = profile.currentRank
      ? `Para o seu momento atual em ${profile.currentRank}, `
      : '';
    const targetTail = profile.targetRank
      ? ` O objetivo e construir uma base que sustente a subida para ${profile.targetRank}.`
      : '';

    switch (diagnosis.priority) {
      case 'avoid_first_death':
        return `${rankLead}o treino foi puxado para sobrevivencia porque suas primeiras mortes ainda estao custando rounds cedo demais.${targetTail}`;
      case 'improve_positioning':
        return `${rankLead}o foco de treino foi reposicionamento porque essa ainda e a area com melhor retorno imediato nas ultimas partidas.${targetTail}`;
      case 'improve_utility_usage':
        return `${rankLead}o treino prioriza utilidade porque voce ja tem rounds jogaveis, mas ainda deixa valor na mesa antes dos duelos importantes.${targetTail}`;
      case 'improve_crosshair_discipline':
        return `${rankLead}o treino foi montado para estabilizar a mira porque seu crosshair segue sendo a maior oscilacao do bloco recente.${targetTail}`;
      case 'improve_consistency':
        return `${rankLead}o plano prioriza consistencia porque sua base mostra oscilacao maior do que falta de um fundamento isolado.${targetTail}`;
    }
  }
}
