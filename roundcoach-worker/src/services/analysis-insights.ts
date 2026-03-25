type AnalysisMetricKey =
  | 'positioning'
  | 'utility'
  | 'crosshair'
  | 'survival'
  | 'entry';

interface AnalysisMetricsInput {
  deathsFirst: number;
  entryKills: number;
  crosshairScore: number;
  utilityUsageScore: number;
  positioningScore: number;
}

const METRIC_LABELS: Record<AnalysisMetricKey, string> = {
  positioning: 'posicionamento',
  utility: 'uso de utilidade',
  crosshair: 'crosshair',
  survival: 'sobrevivencia no first contact',
  entry: 'entrada e abertura',
};

export function buildSummaryFromMetrics(input: AnalysisMetricsInput): string {
  const metrics = {
    positioning: clampScore(input.positioningScore),
    utility: clampScore(input.utilityUsageScore),
    crosshair: clampScore(input.crosshairScore),
    survival: clampScore(100 - input.deathsFirst * 11),
    entry: clampScore(input.entryKills * 8.5),
  } satisfies Record<AnalysisMetricKey, number>;

  const ranked = (
    Object.entries(metrics) as Array<[AnalysisMetricKey, number]>
  ).sort((left, right) => left[1] - right[1]);

  const weaknessKey = ranked[0]?.[0] ?? 'positioning';
  const strengthKey = ranked.at(-1)?.[0] ?? 'crosshair';
  const overallScore = Math.round(
    metrics.positioning * 0.28 +
      metrics.utility * 0.18 +
      metrics.crosshair * 0.28 +
      metrics.survival * 0.16 +
      metrics.entry * 0.1,
  );

  const scenario = detectScenario(metrics, overallScore);

  const templates = {
    fragile_openings:
      'Seu ganho mais imediato esta em sobreviver melhor ao primeiro contato. Nesta partida, crosshair, posicionamento e first death ficaram abaixo da media esperada ao mesmo tempo, o que explica rounds ficando caros cedo demais.',
    good_prep_low_conversion:
      'A base da partida foi melhor do que o placar de impacto sugere. Sua preparacao com utilidade e a disposicao para abrir espaco apareceram bem, mas ainda faltou converter isso em rounds mais limpos e consistentes.',
    balanced_mid:
      'Foi uma partida equilibrada, sem um gargalo unico muito gritante. O proximo salto aqui nao pede mudanca radical, e sim elevar um ponto so por vez para empurrar o score geral para cima.',
    mechanics_ahead_of_discipline: `Sua mecanica segurou boa parte da partida, mas a disciplina de espaco nao acompanhou no mesmo nivel. Quando o ${METRIC_LABELS[strengthKey]} aparece acima do ${METRIC_LABELS[weaknessKey]}, o ajuste mais rentavel costuma estar na tomada de espaco e na exposicao depois do contato.`,
    stable_round_presence:
      'A partida mostrou uma base solida de presenca em round. Seu posicionamento e sua sobrevivencia sustentaram bem a leitura, entao o foco agora e transformar essa estabilidade em ainda mais conversao.',
    proactive_impact:
      'Voce jogou com iniciativa e criou pressao real. Entrada e utilidade andaram juntas, o que da uma cara mais concreta de impacto e deixa o score geral mais confiavel.',
    structured_but_passive:
      'A estrutura da partida foi boa, mas ainda faltou transformar preparo em pressao. Quando utilidade e posicionamento aparecem acima da entrada, o proximo passo costuma ser assumir um pouco mais de conversao nos duelos de abertura.',
    high_baseline:
      'A partida passou uma sensacao de base forte e relativamente completa. O caminho agora e preservar o que ja funciona e escolher um ajuste pequeno para continuar evoluindo sem perder consistencia.',
    single_focus_improvement: `Seu score geral ficou em ${overallScore}, com o maior espaco de evolucao em ${METRIC_LABELS[weaknessKey]}. Como o restante da base ainda sustenta a partida, um ajuste concentrado aqui ja deve gerar uma melhora perceptivel.`,
  } as const;

  return templates[scenario];
}

function detectScenario(
  metrics: Record<AnalysisMetricKey, number>,
  overallScore: number,
):
  | 'fragile_openings'
  | 'good_prep_low_conversion'
  | 'balanced_mid'
  | 'mechanics_ahead_of_discipline'
  | 'stable_round_presence'
  | 'proactive_impact'
  | 'structured_but_passive'
  | 'high_baseline'
  | 'single_focus_improvement' {
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

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value * 10) / 10));
}
