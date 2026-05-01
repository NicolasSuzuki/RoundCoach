import { createHash } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { AnalysisProcessingStatus, Prisma } from '@prisma/client';
import { CoachWriterService } from '../../../domain/coach-writer/coach-writer.service';
import { PlayerDiagnosisEngineService } from '../../../domain/player-diagnosis-engine/player-diagnosis-engine.service';
import { TrainingEngineService } from '../../../domain/training-engine/training-engine.service';
import { AnalysisMetricKey } from '../../../domain/insight-engine/insight-engine';
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
        updatedAt: true;
        matchDate: true;
        importedSnapshot: {
          select: {
            queueId: true;
            updatedAt: true;
          };
        };
        scoreboardPlayers: {
          where: {
            isCurrentUser: true;
          };
          take: 1;
        };
      };
    };
  };
}>;

type DashboardSummaryPayload = {
  totalAnalysedMatches: number;
  averageScore: number;
  lastScore: number;
  bestScore: number;
  lastFiveAverageScore: number;
  trend: 'up' | 'down' | 'stable';
  processedMatchRate: number;
  mainWeakness: string;
  mainStrength: string;
  focusSuggestion: string;
  weeklyWeakness: string;
  recurringStrength: string;
  profileCurrentRank: string | null;
  profileCurrentGoal: string | null;
  profileMainAgents: string[];
  profileMainRole: string | null;
  profileCurrentFocus: string | null;
  coachWritingSource: 'ai' | 'deterministic';
  observation: string;
  recommendedTraining: string[];
};

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly coachWriterService: CoachWriterService,
    private readonly playerDiagnosisEngineService: PlayerDiagnosisEngineService,
    private readonly trainingEngineService: TrainingEngineService,
  ) {}

  async getSummary(userId: string) {
    const [analyses, profile, totalMatches] = await Promise.all([
      this.getCompletedAnalyses(userId),
      this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          currentRank: true,
          currentGoal: true,
          mainAgents: true,
          mainRole: true,
          currentFocus: true,
          updatedAt: true,
        },
      }),
      this.prisma.match.count({
        where: { userId },
      }),
    ]);
    const signature = this.buildSummarySignature({
      analyses,
      profile,
      totalMatches,
    });
    const cachedSnapshot = await this.prisma.dashboardSummarySnapshot.findUnique({
      where: { userId },
    });

    if (cachedSnapshot?.signature === signature) {
      return cachedSnapshot.payload as unknown as DashboardSummaryPayload;
    }

    let payload: DashboardSummaryPayload;
    if (analyses.length === 0) {
      payload = {
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
        coachWritingSource: 'deterministic' as const,
        observation:
          'Ainda nao ha partidas analisadas. Processe um VOD para comecar a gerar progresso.',
        recommendedTraining: [
          'Jogue uma partida ranqueada ou custom para gerar dados.',
          'Associe um VOD e processe a analise.',
          'Volte ao dashboard para acompanhar sua evolucao.',
        ],
      };
    } else {
      const scoredAnalyses = analyses.map((analysis) => ({
        ...analysis,
        score: calculateOverallScore(analysis),
        metrics: extractAnalysisMetricScores(analysis),
      }));
      const diagnosis = this.playerDiagnosisEngineService.diagnose(
        scoredAnalyses.map((analysis) => ({
          matchId: analysis.match.id,
          matchDate: analysis.match.matchDate,
          score: analysis.score,
          metricScores: analysis.metrics,
          queueId: analysis.match.importedSnapshot?.queueId,
          currentPlayer: analysis.match.scoreboardPlayers[0] ?? null,
        })),
      );
      const processedMatchRate =
        totalMatches > 0
          ? Math.round((scoredAnalyses.length / totalMatches) * 100)
          : 0;
      const coachWriting = await this.coachWriterService.write({
        diagnosis,
        profile,
      });

      payload = {
        totalAnalysedMatches: diagnosis.sampleSize,
        averageScore: diagnosis.averageScore,
        lastScore: diagnosis.lastScore,
        bestScore: diagnosis.bestScore,
        lastFiveAverageScore: diagnosis.lastFiveAverageScore,
        trend: diagnosis.trend,
        processedMatchRate,
        mainWeakness: diagnosis.mainWeakness,
        mainStrength: diagnosis.mainStrength,
        focusSuggestion: diagnosis.focusSuggestion,
        weeklyWeakness: diagnosis.weeklyWeakness,
        recurringStrength: diagnosis.recurringStrength,
        profileCurrentRank: profile?.currentRank ?? null,
        profileCurrentGoal: profile?.currentGoal ?? null,
        profileMainAgents: profile?.mainAgents ?? [],
        profileMainRole: profile?.mainRole ?? null,
        profileCurrentFocus: profile?.currentFocus ?? null,
        coachWritingSource: coachWriting.source,
        observation: coachWriting.observation,
        recommendedTraining: this.buildRecommendedTraining(
          coachWriting.recommendedTraining,
          profile,
        ),
      };
    }

    await this.prisma.dashboardSummarySnapshot.upsert({
      where: { userId },
      create: {
        userId,
        signature,
        payload: payload as Prisma.InputJsonValue,
      },
      update: {
        signature,
        payload: payload as Prisma.InputJsonValue,
      },
    });

    return payload;
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

  async getTrainingPlan(userId: string) {
    const plan = await this.trainingEngineService.getCurrentPlan(userId);

    return {
      focusArea: plan.focusArea,
      dailyTrainingPlan: plan.dailyTrainingPlan,
      weeklyFocusPlan: plan.weeklyFocusPlan,
      microGoal: plan.microGoal,
      justification: plan.justification,
      trend: plan.trend,
      mainWeakness: plan.mainWeakness,
      mainStrength: plan.mainStrength,
      intensity: plan.intensity,
      isOnboarding: plan.isOnboarding,
    };
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
            updatedAt: true,
            matchDate: true,
            importedSnapshot: {
              select: {
                queueId: true,
                updatedAt: true,
              },
            },
            scoreboardPlayers: {
              where: {
                isCurrentUser: true,
              },
              take: 1,
            },
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

  private buildSummarySignature(input: {
    analyses: DashboardAnalysis[];
    profile:
      | {
          currentRank: string | null;
          currentGoal: string | null;
          mainAgents: string[];
          mainRole: string | null;
          currentFocus: string | null;
          updatedAt: Date;
        }
      | null;
    totalMatches: number;
  }): string {
    const sourcePayload = {
      totalMatches: input.totalMatches,
      profile: input.profile
        ? {
            currentRank: input.profile.currentRank,
            currentGoal: input.profile.currentGoal,
            mainAgents: input.profile.mainAgents,
            mainRole: input.profile.mainRole,
            currentFocus: input.profile.currentFocus,
            updatedAt: input.profile.updatedAt.toISOString(),
          }
        : null,
      analyses: input.analyses.map((analysis) => ({
        id: analysis.id,
        updatedAt: analysis.updatedAt.toISOString(),
        matchId: analysis.match.id,
        matchDate: analysis.match.matchDate.toISOString(),
        matchUpdatedAt: analysis.match.updatedAt.toISOString(),
        queueId: analysis.match.importedSnapshot?.queueId ?? null,
        importedSnapshotUpdatedAt:
          analysis.match.importedSnapshot?.updatedAt.toISOString() ?? null,
        currentPlayerId: analysis.match.scoreboardPlayers[0]?.id ?? null,
        currentPlayerUpdatedAt:
          analysis.match.scoreboardPlayers[0]?.updatedAt.toISOString() ?? null,
      })),
    };

    return createHash('sha256')
      .update(JSON.stringify(sourcePayload))
      .digest('hex');
  }
}
