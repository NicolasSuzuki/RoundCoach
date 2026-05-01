import { TrainingPriority } from '../types/training-diagnosis.type';
import { DailyTrainingPlan, WeeklyFocusPlan } from '../types/training-plan.type';

type TemplateRecord<T> = Record<TrainingPriority, T>;

export const DAILY_PLAN_TEMPLATES: TemplateRecord<DailyTrainingPlan> = {
  avoid_first_death: {
    warmup: [
      '5 min de leitura de angulos e timing antes de acelerar.',
      '1 deathmatch com meta de sair vivo do primeiro contato.',
    ],
    inGame: [
      'Nao abra choke sem info, util ou trade perto.',
      'Se for entrar, defina antes o caminho de trade da sua {role}.',
      'Aceite ceder espaco em rounds ruins em vez de forcar duelo cedo.',
    ],
    review: [
      'Revise os rounds em que morreu primeiro e classifique: falta de info, falta de util ou excesso de confianca.',
      'Marque um padrao para cortar na proxima fila.',
    ],
  },
  improve_positioning: {
    warmup: [
      '10 min de pre-aim com disciplina de cover.',
      '1 deathmatch focando trocar de angulo apos cada contato.',
    ],
    inGame: [
      'Nao repita peek sem vantagem clara.',
      'Depois de cada contato, reposicione antes de brigar de novo.',
      'Use cover para alongar rounds em vez de expor corpo inteiro cedo.',
    ],
    review: [
      'Revise rounds em que morreu exposto apos o primeiro tiro.',
      'Anote um angulo ou habito que mais te puniu hoje.',
    ],
  },
  improve_utility_usage: {
    warmup: [
      'Revise 3 usos simples de util dos seus agentes: {agents}.',
      'Entre em custom e repita setups ou alinhamentos basicos por 10 min.',
    ],
    inGame: [
      'Use util antes de abrir espaco ou contestar choke.',
      'Como {role}, pense em valor de util por round e nao so em guardar recurso.',
      'Nao entre em duelo importante sem criar vantagem antes.',
    ],
    review: [
      'Revise rounds em que a utilidade ficou guardada e nao gerou impacto.',
      'Marque pelo menos um round em que util boa teria mudado o duelo.',
    ],
  },
  improve_crosshair_discipline: {
    warmup: [
      '8 min de micro ajuste e tracking leve.',
      '1 deathmatch focando altura fixa de mira e chegada pronta no angulo.',
    ],
    inGame: [
      'Mantenha crosshair na altura do primeiro contato nos angulos mais comuns.',
      'Evite flick grande quando o pre-aim resolveria.',
      'Desacelere a entrada em angulos longos para chegar com a mira pronta.',
    ],
    review: [
      'Revise contatos em que a mira chegou atrasada.',
      'Anote os angulos em que voce mais baixa ou levanta demais a mira.',
    ],
  },
  improve_consistency: {
    warmup: [
      'Warmup curto e equilibrado: 5 min de mira, 5 min de pre-aim e 5 min de util.',
      'Entre na fila so quando sentir repeticao limpa em vez de volume alto.',
    ],
    inGame: [
      'Repita um plano simples por duas partidas seguidas.',
      'Nao mude seu estilo a cada round ruim.',
      'Proteja o que ja esta funcionando e mexa so no foco da semana.',
    ],
    review: [
      'Compare uma boa partida com uma ruim e identifique a primeira quebra de disciplina.',
      'Anote o ajuste mais simples que deixa seu jogo repetivel.',
    ],
  },
};

export const WEEKLY_PLAN_TEMPLATES: TemplateRecord<WeeklyFocusPlan> = {
  avoid_first_death: {
    title: 'Semana de sobrevivencia no primeiro contato',
    goals: [
      'Diminuir as primeiras mortes nas proximas filas.',
      'Entrar em round so com info, util ou caminho de trade.',
      'Revisar o primeiro erro de exposicao de cada partida.',
    ],
  },
  improve_positioning: {
    title: 'Semana de posicionamento e disciplina de angulo',
    goals: [
      'Reposicionar depois do primeiro contato em mais rounds.',
      'Evitar repetir peek sem vantagem clara.',
      'Transformar cover em padrao e nao em excecao.',
    ],
  },
  improve_utility_usage: {
    title: 'Semana de utilidade com valor real',
    goals: [
      'Usar mais recurso antes de abrir espaco.',
      'Extrair mais valor da util dos agentes {agents}.',
      'Rever rounds em que a util ficou guardada demais.',
    ],
  },
  improve_crosshair_discipline: {
    title: 'Semana de disciplina de mira e chegada pronta',
    goals: [
      'Chegar em mais angulos com crosshair na altura certa.',
      'Reduzir flicks desnecessarios em duelos previsiveis.',
      'Levar a consistencia do treino de aim para o mid round.',
    ],
  },
  improve_consistency: {
    title: 'Semana de consistencia e plano simples',
    goals: [
      'Manter a mesma base de decisao por varias partidas.',
      'Reduzir oscilacao entre jogos fortes e fracos.',
      'Sustentar um processo simples rumo a {targetRank}.',
    ],
  },
};
