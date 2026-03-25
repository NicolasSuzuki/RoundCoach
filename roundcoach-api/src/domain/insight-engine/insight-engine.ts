import {
  AnalysisMetricKey,
  AnalysisMetricsInput,
  calculateOverallScore,
  extractAnalysisMetricScores,
} from '../scoring/scoring-engine';

export type { AnalysisMetricKey, AnalysisMetricsInput } from '../scoring/scoring-engine';

export interface AnalysisInsights {
  overallScore: number;
  scenario:
    | 'fragile_openings'
    | 'good_prep_low_conversion'
    | 'balanced_mid'
    | 'mechanics_ahead_of_discipline'
    | 'stable_round_presence'
    | 'proactive_impact'
    | 'structured_but_passive'
    | 'high_baseline'
    | 'single_focus_improvement';
  strengthKey: AnalysisMetricKey;
  strengthLabel: string;
  strengthText: string;
  weaknessKey: AnalysisMetricKey;
  weaknessLabel: string;
  weaknessText: string;
  focusSuggestion: string;
  microGoal: string;
  recommendedTraining: string[];
  summary: string;
  metricScores: Record<AnalysisMetricKey, number>;
}

const METRIC_LABELS: Record<AnalysisMetricKey, string> = {
  positioning: 'Posicionamento',
  utility: 'Uso de utilidade',
  crosshair: 'Crosshair',
  survival: 'Sobrevivencia no first contact',
  entry: 'Entrada e abertura',
};

const FOCUS_SUGGESTIONS: Record<AnalysisMetricKey, string> = {
  positioning: 'improve_post_contact_positioning',
  utility: 'use_utility_before_peeking',
  crosshair: 'stabilize_crosshair_placement',
  survival: 'avoid_first_death',
  entry: 'convert_opening_duels',
};

const TRAINING_BY_METRIC: Record<AnalysisMetricKey, string[]> = {
  positioning: [
    '10 min revendo os reposicionamentos perdidos depois do primeiro contato.',
    '2 deathmatches focando trocar de angulo depois do primeiro tiro.',
    'Evitar reabrir o mesmo angulo sem vantagem clara de cover.',
  ],
  utility: [
    'Entrar em custom por 10 min e repetir rotinas de util antes do peek.',
    'Jogar 2 filas pensando em usar recurso antes de cada duelo importante.',
    'Marcar rounds em que a utilidade ficou guardada sem gerar vantagem.',
  ],
  crosshair: [
    '10 min de micro ajuste e pre-aim antes da primeira fila.',
    '2 deathmatches focando altura fixa de mira e chegada pronta no angulo.',
    'Reduzir flicks desnecessarios quando a mira puder chegar preparada.',
  ],
  survival: [
    'Jogar 2 deathmatches com meta de sair vivo do primeiro contato.',
    'Evitar abrir choke sem util, info ou trade proximo.',
    'Revisar as primeiras mortes e marcar padroes de excesso de exposicao.',
  ],
  entry: [
    'Treinar timing de entrada com util por 10 min em custom.',
    '2 deathmatches focando wide swing com confirmacao rapida.',
    'Escolher melhor quais duelos de abertura realmente valem o risco.',
  ],
};

export function buildAnalysisInsights(
  input: AnalysisMetricsInput,
): AnalysisInsights {
  const metricScores = extractAnalysisMetricScores(input);
  const rankedMetrics = (
    Object.entries(metricScores) as Array<[AnalysisMetricKey, number]>
  ).sort((left, right) => left[1] - right[1]);

  const weaknessKey = rankedMetrics[0]?.[0] ?? 'positioning';
  const strengthKey = rankedMetrics.at(-1)?.[0] ?? 'crosshair';
  const overallScore = calculateOverallScore(input);
  const scenario = detectScenario(metricScores, overallScore);

  return {
    overallScore,
    scenario,
    strengthKey,
    strengthLabel: METRIC_LABELS[strengthKey],
    strengthText: buildStrengthText(strengthKey, overallScore),
    weaknessKey,
    weaknessLabel: METRIC_LABELS[weaknessKey],
    weaknessText: buildWeaknessText(weaknessKey, metricScores[weaknessKey]),
    focusSuggestion: FOCUS_SUGGESTIONS[weaknessKey],
    microGoal: buildMicroGoal(weaknessKey),
    recommendedTraining: TRAINING_BY_METRIC[weaknessKey],
    summary: buildSummary(scenario, overallScore, weaknessKey, strengthKey),
    metricScores,
  };
}

function detectScenario(
  metrics: Record<AnalysisMetricKey, number>,
  overallScore: number,
): AnalysisInsights['scenario'] {
  const spread =
    Math.max(...Object.values(metrics)) - Math.min(...Object.values(metrics));

  if (
    metrics.survival < 45 &&
    metrics.positioning < 60 &&
    metrics.crosshair < 62
  ) {
    return 'fragile_openings';
  }

  if (
    metrics.utility >= 72 &&
    metrics.entry >= 60 &&
    overallScore >= 55 &&
    overallScore <= 72
  ) {
    return 'good_prep_low_conversion';
  }

  if (spread <= 10 && overallScore >= 58 && overallScore <= 76) {
    return 'balanced_mid';
  }

  if (metrics.crosshair >= 74 && metrics.positioning < 62) {
    return 'mechanics_ahead_of_discipline';
  }

  if (metrics.positioning >= 74 && metrics.survival >= 68) {
    return 'stable_round_presence';
  }

  if (metrics.entry >= 72 && metrics.utility >= 70) {
    return 'proactive_impact';
  }

  if (
    metrics.utility >= 74 &&
    metrics.positioning >= 70 &&
    metrics.entry < 58
  ) {
    return 'structured_but_passive';
  }

  if (overallScore >= 78) {
    return 'high_baseline';
  }

  return 'single_focus_improvement';
}

function buildSummary(
  scenario: AnalysisInsights['scenario'],
  overallScore: number,
  weaknessKey: AnalysisMetricKey,
  strengthKey: AnalysisMetricKey,
): string {
  const weaknessLabel = METRIC_LABELS[weaknessKey].toLowerCase();
  const strengthLabel = METRIC_LABELS[strengthKey].toLowerCase();

  const templates: Record<AnalysisInsights['scenario'], string> = {
    fragile_openings: `Seu ganho mais imediato esta em sobreviver melhor ao primeiro contato. Nesta partida, crosshair, posicionamento e first death ficaram abaixo da media esperada ao mesmo tempo, o que explica rounds ficando caros cedo demais.`,
    good_prep_low_conversion: `A base da partida foi melhor do que o placar de impacto sugere. Sua preparacao com utilidade e a disposicao para abrir espaco apareceram bem, mas ainda faltou converter isso em rounds mais limpos e consistentes.`,
    balanced_mid: `Foi uma partida equilibrada, sem um gargalo unico muito gritante. O proximo salto aqui nao pede mudanca radical, e sim elevar um ponto so por vez para empurrar o score geral para cima.`,
    mechanics_ahead_of_discipline: `Sua mecanica segurou boa parte da partida, mas a disciplina de espaco nao acompanhou no mesmo nivel. Quando o ${strengthLabel} aparece acima do ${weaknessLabel}, o ajuste mais rentavel costuma estar na tomada de espaco e na exposicao depois do contato.`,
    stable_round_presence: `A partida mostrou uma base solida de presenca em round. Seu posicionamento e sua sobrevivencia sustentaram bem a leitura, entao o foco agora e transformar essa estabilidade em ainda mais conversao.`,
    proactive_impact: `Voce jogou com iniciativa e criou pressao real. Entrada e utilidade andaram juntas, o que da uma cara mais concreta de impacto e deixa o score geral mais confiavel.`,
    structured_but_passive: `A estrutura da partida foi boa, mas ainda faltou transformar preparo em pressao. Quando utilidade e posicionamento aparecem acima da entrada, o proximo passo costuma ser assumir um pouco mais de conversao nos duelos de abertura.`,
    high_baseline: `A partida passou uma sensacao de base forte e relativamente completa. O caminho agora e preservar o que ja funciona e escolher um ajuste pequeno para continuar evoluindo sem perder consistencia.`,
    single_focus_improvement: `Seu score geral ficou em ${overallScore}, com o maior espaco de evolucao em ${weaknessLabel}. Como o restante da base ainda sustenta a partida, um ajuste concentrado aqui ja deve gerar uma melhora perceptivel.`,
  };

  return templates[scenario];
}

function buildStrengthText(
  strengthKey: AnalysisMetricKey,
  overallScore: number,
): string {
  const texts: Record<AnalysisMetricKey, string> = {
    positioning:
      'Seu posicionamento foi a base mais confiavel desta partida. Isso ajuda a manter rounds mais jogaveis mesmo quando a execucao nao sai perfeita.',
    utility:
      'Seu uso de utilidade apareceu como ponto de sustentacao. Essa leitura de recurso e uma boa ancora para evoluir sem perder consistencia.',
    crosshair:
      'Sua mira foi o aspecto mais estavel desta partida. Ter essa base mecanica ajuda muito a absorver melhor os proximos ajustes.',
    survival:
      'Sua sobrevivencia no primeiro contato foi um dos pontos que mais segurou valor na partida. Isso costuma abrir mais espaco para decisao boa no meio do round.',
    entry:
      'Sua abertura de espaco apareceu como ponto forte. Quando esse timing entra bem, o restante da rodada fica naturalmente mais simples.',
  };

  return overallScore >= 75
    ? `${texts[strengthKey]} O importante agora e manter esse nivel enquanto sobe o restante da base.`
    : `${texts[strengthKey]} Vale preservar isso como referencia enquanto voce trabalha o proximo ajuste.`;
}

function buildWeaknessText(
  weaknessKey: AnalysisMetricKey,
  metricScore: number,
): string {
  const texts: Record<AnalysisMetricKey, string> = {
    positioning:
      'O maior ganho disponivel hoje esta no posicionamento depois do primeiro contato. Pequenos ajustes de angulo e cover devem trazer retorno rapido.',
    utility:
      'Seu maior espaco de evolucao hoje esta em preparar melhor o duelo com utilidade. Esse costuma ser um ajuste que melhora a partida inteira, nao so um round.',
    crosshair:
      'Seu ponto de foco mais claro esta no crosshair. A boa noticia e que esse tipo de ajuste costuma responder rapido quando o treino e simples e consistente.',
    survival:
      'Seu foco mais rentavel hoje esta em sobreviver melhor ao primeiro contato. Ajustar esse momento tende a aliviar o restante do round.',
    entry:
      'Seu maior espaco de crescimento agora esta em converter melhor as entradas. Um ajuste de timing e confirmacao ja pode mudar bastante seu impacto.',
  };

  return metricScore < 50
    ? texts[weaknessKey]
    : `${texts[weaknessKey]} A base nao esta ruim, mas ainda e o ponto com melhor retorno para a proxima fila.`;
}

function buildMicroGoal(weaknessKey: AnalysisMetricKey): string {
  const goals: Record<AnalysisMetricKey, string> = {
    positioning:
      'Na proxima fila, depois de cada contato, tente trocar de angulo ou recuar para cover antes de brigar de novo.',
    utility:
      'Na proxima fila, entre em cada duelo importante so depois de usar pelo menos um recurso para criar vantagem.',
    crosshair:
      'Na proxima fila, jogue com uma meta mental: chegar em cada angulo com a mira pronta na altura certa.',
    survival:
      'Na proxima fila, priorize nao ser a primeira eliminacao sem info ou trade proximo.',
    entry:
      'Na proxima fila, escolha melhor quais duelos de abertura realmente valem o risco e entre com timing mais claro.',
  };

  return goals[weaknessKey];
}
