import { TrainingPriority } from '../types/training-diagnosis.type';
import { TrainingProfileInput } from '../types/training-input.type';

export function buildMicroGoal(
  priority: TrainingPriority,
  profile: TrainingProfileInput,
): string {
  const roleHint = buildRoleHint(profile.mainRole);

  switch (priority) {
    case 'avoid_first_death':
      return `Na proxima partida, sobreviva aos primeiros contatos sem entrar seco${roleHint}.`;
    case 'improve_positioning':
      return `Na proxima partida, depois de cada contato, troque de angulo ou recue para cover antes de repetir o peek${roleHint}.`;
    case 'improve_utility_usage':
      return `Na proxima partida, nao abra espaco sem usar pelo menos um recurso para criar vantagem${roleHint}.`;
    case 'improve_crosshair_discipline':
      return `Na proxima partida, jogue com a meta mental de manter a mira pronta na altura do primeiro contato${roleHint}.`;
    case 'improve_consistency':
      return `Na proxima partida, mantenha um plano simples por todos os rounds e repita so as decisoes que estao funcionando${roleHint}.`;
  }
}

function buildRoleHint(mainRole?: string | null): string {
  if (!mainRole) {
    return '';
  }

  switch (mainRole.toLowerCase()) {
    case 'duelist':
    case 'duelista':
      return ', com caminho de trade claro para sua entrada';
    case 'sentinel':
    case 'sentinela':
      return ', preservando utilidade e setup para o momento certo';
    case 'controller':
    case 'controlador':
      return ', protegendo timing de smoke e reposicionamento';
    case 'initiator':
    case 'iniciador':
      return ', garantindo info antes de acelerar';
    default:
      return '';
  }
}
