import { Injectable } from '@nestjs/common';
import { AnalysisProcessingStatus, Prisma } from '@prisma/client';
import {
  AnalysisInsights,
  AnalysisMetricKey,
  buildAnalysisInsights,
} from '../../../domain/insight-engine/insight-engine';
import {
  calculateOverallScore,
  extractAnalysisMetricScores,
} from '../../../domain/scoring/scoring-engine';
import { PrismaService } from '../../../database/prisma/prisma.service';

type DashboardAnalysis = Prisma.AnalysisGetPayload<{
  include: {
    match: {
      select: {
        id: true;
        matchDate: true;
      };
    };
  };
}>;

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(userId: string) {
    const analyses = await this.getCompletedAnalyses(userId);
    const profile = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        currentRank: true,
        currentGoal: true,
        mainAgents: true,
        mainRole: true,
        currentFocus: true,
      },
    });
    const totalMatches = await this.prisma.match.count({
      where: { userId },
    });

    if (analyses.length === 0) {
      return {
        totalAnalysedMatches: 0,
        averageScore: 0,
        lastScore: 0,
        bestScore: 0,
        lastFiveAverageScore: 0,
        trend: 'stable' as const,
        processedMatchRate: totalMatches > 0 ? 0 : 0,
        mainWeakness: 'no_data',
        mainStrength: 'no_data',
        focusSuggestion: 'play_and_process_matches',
        weeklyWeakness: 'no_data',
        recurringStrength: 'no_data',
        profileCurrentRank: profile?.currentRank ?? null,
        profileCurrentGoal: profile?.currentGoal ?? null,
        profileMainAgents: profile?.mainAgents ?? [],
        profileMainRole: profile?.mainRole ?? null,
        profileCurrentFocus: profile?.currentFocus ?? null,
        observation:
          'Ainda nao ha partidas analisadas. Processe um VOD para comecar a gerar progresso.',
        recommendedTraining: [
          'Jogue uma partida ranqueada ou custom para gerar dados.',
          'Associe um VOD e processe a analise.',
          'Volte ao dashboard para acompanhar sua evolucao.',
        ],
      };
    }

    const scoredAnalyses = analyses.map((analysis) => ({
      ...analysis,
      score: calculateOverallScore(analysis),
      metrics: extractAnalysisMetricScores(analysis),
    }));

    const averageScore = Math.round(
      scoredAnalyses.reduce((total, analysis) => total + analysis.score, 0) /
        scoredAnalyses.length,
    );
    const bestScore = Math.max(...scoredAnalyses.map((analysis) => analysis.score));
    const recentFive = scoredAnalyses.slice(0, 5);
    const lastFiveAverageScore = Math.round(
      recentFive.reduce((total, analysis) => total + analysis.score, 0) /
        recentFive.length,
    );
    const lastAnalysis = [...scoredAnalyses].sort((left, right) => {
      return right.match.matchDate.getTime() - left.match.matchDate.getTime();
    })[0];

    const metricAverages = this.calculateMetricAverages(scoredAnalyses);
    const rankedMetrics = Object.entries(metricAverages).sort(
      (left, right) => left[1] - right[1],
    ) as Array<[AnalysisMetricKey, number]>;

    const mainWeakness = rankedMetrics[0]?.[0] ?? 'positioning';
    const mainStrength = rankedMetrics.at(-1)?.[0] ?? 'crosshair';
    const averageInsights = this.buildAverageInsights(metricAverages);
    const weeklyMetrics = this.calculateMetricAverages(
      scoredAnalyses.slice(0, 5),
    );
    const weeklyRankedMetrics = Object.entries(weeklyMetrics).sort(
      (left, right) => left[1] - right[1],
    ) as Array<[AnalysisMetricKey, number]>;
    const weeklyWeakness = weeklyRankedMetrics[0]?.[0] ?? mainWeakness;
    const recurringStrength = weeklyRankedMetrics.at(-1)?.[0] ?? mainStrength;
    const processedMatchRate =
      totalMatches > 0
        ? Math.round((scoredAnalyses.length / totalMatches) * 100)
        : 0;

    return {
      totalAnalysedMatches: scoredAnalyses.length,
      averageScore,
      lastScore: lastAnalysis.score,
      bestScore,
      lastFiveAverageScore,
      trend: this.calculateTrend(scoredAnalyses),
      processedMatchRate,
      mainWeakness,
      mainStrength,
      focusSuggestion: averageInsights.focusSuggestion,
      weeklyWeakness,
      recurringStrength,
      profileCurrentRank: profile?.currentRank ?? null,
      profileCurrentGoal: profile?.currentGoal ?? null,
      profileMainAgents: profile?.mainAgents ?? [],
      profileMainRole: profile?.mainRole ?? null,
      profileCurrentFocus: profile?.currentFocus ?? null,
      observation: this.buildObservation(
        mainWeakness,
        scoredAnalyses,
        averageInsights,
        profile,
      ),
      recommendedTraining: this.buildRecommendedTraining(
        averageInsights.recommendedTraining,
        profile,
      ),
    };
  }

  async getEvolution(userId: string) {
    const analyses = await this.getCompletedAnalyses(userId);

    return analyses
      .sort((left, right) => left.match.matchDate.getTime() - right.match.matchDate.getTime())
      .map((analysis, index) => ({
        matchId: analysis.match.id,
        label: `Partida ${index + 1}`,
        score: calculateOverallScore(analysis),
        matchDate: analysis.match.matchDate.toISOString(),
      }));
  }

  private async getCompletedAnalyses(userId: string): Promise<DashboardAnalysis[]> {
    return this.prisma.analysis.findMany({
      where: {
        processingStatus: AnalysisProcessingStatus.COMPLETED,
        match: {
          userId,
        },
      },
      include: {
        match: {
          select: {
            id: true,
            matchDate: true,
          },
        },
      },
      orderBy: {
        match: {
          matchDate: 'desc',
        },
      },
      take: 20,
    });
  }

  private calculateMetricAverages(
    analyses: Array<{ metrics: Record<AnalysisMetricKey, number> }>,
  ) {
    const totals: Record<AnalysisMetricKey, number> = {
      positioning: 0,
      utility: 0,
      crosshair: 0,
      survival: 0,
      entry: 0,
    };

    analyses.forEach((analysis) => {
      (Object.keys(totals) as AnalysisMetricKey[]).forEach((key) => {
        totals[key] += analysis.metrics[key];
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

  private buildAverageInsights(
    metricAverages: Record<AnalysisMetricKey, number>,
  ): AnalysisInsights {
    return buildAnalysisInsights({
      positioningScore: metricAverages.positioning,
      utilityUsageScore: metricAverages.utility,
      avgCrosshairScore: metricAverages.crosshair,
      deathsFirst: Math.max(0, Math.round((100 - metricAverages.survival) / 11)),
      entryKills: Math.round(metricAverages.entry / 8.5),
    });
  }

  private buildObservation(
    mainWeakness: AnalysisMetricKey,
    analyses: Array<DashboardAnalysis & { score: number }>,
    averageInsights: AnalysisInsights,
    profile?: {
      currentRank: string | null;
      currentGoal: string | null;
      mainAgents: string[];
      mainRole: string | null;
      currentFocus: string | null;
    } | null,
  ): string {
    const lastFive = analyses.slice(0, 5);
    const averageFirstDeaths = Math.round(
      lastFive.reduce((total, analysis) => total + (analysis.deathsFirst ?? 0), 0) /
        lastFive.length,
    );
    const profileLead = this.buildProfileLead(profile);
    const focusTail = profile?.currentFocus
      ? ` Seu foco declarado hoje e ${profile.currentFocus.toLowerCase()}, entao esse ajuste conversa direto com o que voce quer melhorar agora.`
      : '';

    switch (mainWeakness) {
      case 'positioning':
        return `${profileLead} Nas ultimas ${lastFive.length} partidas, seu maior espaco de ganho esteve no posicionamento. ${averageInsights.weaknessText}${focusTail}`;
      case 'utility':
        return `${profileLead} Nas ultimas ${lastFive.length} partidas, a utilidade ainda nao sustentou o volume de rounds que voce pode converter. ${averageInsights.weaknessText}${focusTail}`;
      case 'crosshair':
        return `${profileLead} Nas ultimas ${lastFive.length} partidas, sua base de crosshair foi o ponto mais irregular. ${averageInsights.weaknessText}${focusTail}`;
      case 'survival':
        return `${profileLead} Nas ultimas ${lastFive.length} partidas voce morreu primeiro em media ${averageFirstDeaths} vezes por jogo. ${averageInsights.weaknessText}${focusTail}`;
      case 'entry':
        return `${profileLead} Nas ultimas ${lastFive.length} partidas, sua abertura de espaco ficou abaixo do potencial da sua base. ${averageInsights.weaknessText}${focusTail}`;
    }
  }

  private buildRecommendedTraining(
    baseTraining: string[],
    profile?: {
      currentRank: string | null;
      currentGoal: string | null;
      mainAgents: string[];
      mainRole: string | null;
      currentFocus: string | null;
    } | null,
  ): string[] {
    const contextualItems = [
      profile?.currentFocus
        ? `Antes da proxima fila, relembre seu foco atual: ${profile.currentFocus}.`
        : null,
      profile?.mainRole
        ? `Jogue os proximos rounds pensando nas decisoes mais limpas para sua role principal: ${profile.mainRole}.`
        : null,
      profile?.mainAgents?.length
        ? `Se possivel, aplique esse ajuste usando seus agentes principais: ${profile.mainAgents.join(', ')}.`
        : null,
    ].filter((item): item is string => Boolean(item));

    return [...baseTraining, ...contextualItems].slice(0, 5);
  }

  private buildProfileLead(profile?: {
    currentRank: string | null;
    currentGoal: string | null;
    mainAgents: string[];
    mainRole: string | null;
    currentFocus: string | null;
  } | null): string {
    const parts = [
      profile?.currentRank ? `Para seu momento atual em ${profile.currentRank}` : null,
      profile?.mainRole ? `jogando principalmente de ${profile.mainRole}` : null,
    ].filter((part): part is string => Boolean(part));

    if (parts.length === 0) {
      return '';
    }

    return `${parts.join(', ')},`;
  }

  private calculateTrend(
    analyses: Array<DashboardAnalysis & { score: number }>,
  ): 'up' | 'down' | 'stable' {
    if (analyses.length < 3) {
      return 'stable';
    }

    const ordered = [...analyses].sort(
      (left, right) => left.match.matchDate.getTime() - right.match.matchDate.getTime(),
    );
    const recentWindow = ordered.slice(-5);
    const previousWindow = ordered.slice(Math.max(0, ordered.length - 10), -5);

    const recentAverage =
      recentWindow.reduce((total, analysis) => total + analysis.score, 0) /
      recentWindow.length;
    const baselineWindow = previousWindow.length > 0 ? previousWindow : ordered.slice(0, 5);
    const baselineAverage =
      baselineWindow.reduce((total, analysis) => total + analysis.score, 0) /
      baselineWindow.length;
    const delta = recentAverage - baselineAverage;

    if (delta >= 4) {
      return 'up';
    }

    if (delta <= -4) {
      return 'down';
    }

    return 'stable';
  }
}
