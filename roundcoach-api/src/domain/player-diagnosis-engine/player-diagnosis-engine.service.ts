import { Injectable } from '@nestjs/common';
import { AnalysisMetricKey } from '../scoring/scoring-engine';
import {
  PlayerDiagnosisMatchInput,
  PlayerDiagnosisResult,
} from './types/player-diagnosis-input.type';

const FOCUS_SUGGESTIONS: Record<AnalysisMetricKey, string> = {
  positioning: 'improve_post_contact_positioning',
  utility: 'use_utility_before_peeking',
  crosshair: 'stabilize_crosshair_placement',
  survival: 'avoid_first_death',
  entry: 'convert_opening_duels',
};

const METRIC_LABELS: Record<AnalysisMetricKey, string> = {
  positioning: 'posicionamento',
  utility: 'uso de utilidade',
  crosshair: 'crosshair',
  survival: 'sobrevivencia inicial',
  entry: 'entrada e abertura',
};

const TRAINING_BY_METRIC: Record<AnalysisMetricKey, string[]> = {
  positioning: [
    'Rever 3 rounds recentes em que voce morreu reposicionando tarde.',
    'Jogar a proxima fila com foco em trocar de angulo depois do primeiro contato.',
    'Evitar repetir o mesmo peek sem informacao nova ou trade proximo.',
  ],
  utility: [
    'Entrar em custom por 10 min e repetir uma rotina simples de util antes do peek.',
    'Na proxima fila, usar recurso antes dos duelos que decidem entrada ou retake.',
    'Rever rounds em que voce morreu com utilidade importante ainda disponivel.',
  ],
  crosshair: [
    'Fazer 10 min de pre-aim antes da primeira fila.',
    'Jogar deathmatch focando altura fixa de mira e chegada pronta no angulo.',
    'Reduzir flicks desnecessarios priorizando posicionamento de mira antes do contato.',
  ],
  survival: [
    'Na proxima fila, priorizar nao ser a primeira eliminacao sem trade possivel.',
    'Rever as primeiras mortes das ultimas partidas e marcar o padrao mais comum.',
    'Evitar abrir choke sem utilidade, informacao ou dupla proxima.',
  ],
  entry: [
    'Treinar timing de entrada com util por 10 min em custom.',
    'Na proxima fila, escolher melhor quais duelos de abertura valem o risco.',
    'Combinar entrada com uma informacao ou utilidade antes do primeiro contato.',
  ],
};

@Injectable()
export class PlayerDiagnosisEngineService {
  diagnose(matches: PlayerDiagnosisMatchInput[]): PlayerDiagnosisResult {
    const eligibleMatches = matches
      .filter((match) => !match.queueId || match.queueId === 'competitive')
      .slice(0, 20);

    if (eligibleMatches.length === 0) {
      return this.emptyDiagnosis();
    }

    const recentFive = eligibleMatches.slice(0, 5);
    const metricAverages = this.averageMetrics(eligibleMatches);
    const weeklyMetricAverages = this.averageMetrics(recentFive);
    const ranked = rankMetrics(metricAverages);
    const weeklyRanked = rankMetrics(weeklyMetricAverages);
    const mainWeakness = ranked[0][0];
    const mainStrength = ranked.at(-1)?.[0] ?? ranked[0][0];
    const weeklyWeakness = weeklyRanked[0][0];
    const recurringStrength = weeklyRanked.at(-1)?.[0] ?? weeklyRanked[0][0];
    const scores = eligibleMatches.map((match) => match.score);
    const averageScore = average(scores);
    const lastFiveAverageScore = average(recentFive.map((match) => match.score));
    const trend = this.calculateTrend(eligibleMatches);
    const consistency = this.calculateConsistency(scores);
    const evidence = this.buildEvidence(eligibleMatches, metricAverages, trend);

    return {
      sampleSize: eligibleMatches.length,
      averageScore,
      lastScore: eligibleMatches[0]?.score ?? 0,
      bestScore: Math.max(...scores),
      lastFiveAverageScore,
      trend,
      consistency,
      mainWeakness,
      mainStrength,
      weeklyWeakness,
      recurringStrength,
      focusSuggestion: FOCUS_SUGGESTIONS[weeklyWeakness],
      observation: this.buildObservation({
        sampleSize: eligibleMatches.length,
        trend,
        consistency,
        mainWeakness: weeklyWeakness,
        mainStrength: recurringStrength,
        averageScore,
        evidence,
      }),
      recommendedTraining: TRAINING_BY_METRIC[weeklyWeakness],
      evidence,
    };
  }

  private emptyDiagnosis(): PlayerDiagnosisResult {
    return {
      sampleSize: 0,
      averageScore: 0,
      lastScore: 0,
      bestScore: 0,
      lastFiveAverageScore: 0,
      trend: 'stable',
      consistency: 'medium',
      mainWeakness: 'no_data',
      mainStrength: 'no_data',
      weeklyWeakness: 'no_data',
      recurringStrength: 'no_data',
      focusSuggestion: 'play_and_process_matches',
      observation:
        'Ainda nao ha partidas competitivas analisadas. Importe ou processe partidas para gerar um diagnostico confiavel.',
      recommendedTraining: [
        'Importe partidas competitivas recentes.',
        'Confira se seu scoreboard aparece no detalhe da partida.',
        'Volte ao dashboard para acompanhar tendencia e foco semanal.',
      ],
      evidence: [],
    };
  }

  private averageMetrics(matches: PlayerDiagnosisMatchInput[]) {
    const totals: Record<AnalysisMetricKey, number> = {
      positioning: 0,
      utility: 0,
      crosshair: 0,
      survival: 0,
      entry: 0,
    };

    for (const match of matches) {
      for (const key of Object.keys(totals) as AnalysisMetricKey[]) {
        totals[key] += match.metricScores[key];
      }
    }

    return Object.keys(totals).reduce(
      (accumulator, key) => {
        const metricKey = key as AnalysisMetricKey;
        accumulator[metricKey] = Math.round(totals[metricKey] / matches.length);
        return accumulator;
      },
      {} as Record<AnalysisMetricKey, number>,
    );
  }

  private calculateTrend(matches: PlayerDiagnosisMatchInput[]) {
    if (matches.length < 6) {
      return 'stable' as const;
    }

    const recentAverage = average(matches.slice(0, 5).map((match) => match.score));
    const previousAverage = average(matches.slice(5, 10).map((match) => match.score));
    const delta = recentAverage - previousAverage;

    if (delta >= 4) {
      return 'up' as const;
    }

    if (delta <= -4) {
      return 'down' as const;
    }

    return 'stable' as const;
  }

  private calculateConsistency(scores: number[]) {
    if (scores.length < 3) {
      return 'medium' as const;
    }

    const avg = average(scores);
    const variance = average(scores.map((score) => (score - avg) ** 2));
    const deviation = Math.sqrt(variance);

    if (deviation <= 7) {
      return 'high' as const;
    }

    if (deviation >= 14) {
      return 'low' as const;
    }

    return 'medium' as const;
  }

  private buildEvidence(
    matches: PlayerDiagnosisMatchInput[],
    metricAverages: Record<AnalysisMetricKey, number>,
    trend: 'up' | 'down' | 'stable',
  ) {
    const currentPlayers = matches
      .map((match) => match.currentPlayer)
      .filter((player): player is NonNullable<typeof player> => Boolean(player));
    const averageAcs = currentPlayers.length
      ? average(currentPlayers.map((player) => player.acs))
      : null;
    const averageFd = currentPlayers.length
      ? average(currentPlayers.map((player) => player.firstDeaths))
      : null;
    const weakest = rankMetrics(metricAverages)[0][0];

    return [
      `Amostra usada: ${matches.length} partidas recentes.`,
      `Tendencia geral: ${trend === 'up' ? 'subindo' : trend === 'down' ? 'caindo' : 'estavel'}.`,
      `Pior media agregada: ${METRIC_LABELS[weakest]}.`,
      averageAcs != null ? `ACS medio recente: ${averageAcs}.` : null,
      averageFd != null ? `First deaths medios: ${averageFd}.` : null,
    ].filter((item): item is string => Boolean(item));
  }

  private buildObservation(input: {
    sampleSize: number;
    trend: 'up' | 'down' | 'stable';
    consistency: 'high' | 'medium' | 'low';
    mainWeakness: AnalysisMetricKey;
    mainStrength: AnalysisMetricKey;
    averageScore: number;
    evidence: string[];
  }) {
    const trendText =
      input.trend === 'up'
        ? 'com tendencia de evolucao'
        : input.trend === 'down'
          ? 'com queda recente de rendimento'
          : 'com rendimento estavel';
    const consistencyText =
      input.consistency === 'high'
        ? 'A consistencia esta boa'
        : input.consistency === 'low'
          ? 'A oscilacao entre partidas ainda esta alta'
          : 'A consistencia esta em zona intermediaria';

    return `Nas ultimas ${input.sampleSize} partidas competitivas analisadas, seu score medio ficou em ${input.averageScore}, ${trendText}. ${consistencyText}. O foco mais relevante agora e ${METRIC_LABELS[input.mainWeakness]}, enquanto ${METRIC_LABELS[input.mainStrength]} aparece como sua base mais confiavel.`;
  }
}

function rankMetrics(metricAverages: Record<AnalysisMetricKey, number>) {
  return (Object.entries(metricAverages) as Array<[AnalysisMetricKey, number]>).sort(
    (left, right) => left[1] - right[1],
  );
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return Math.round(values.reduce((total, value) => total + value, 0) / values.length);
}
