import { Injectable, NotFoundException } from '@nestjs/common';
import { AnalysisProcessingStatus, Prisma, TrainingPlanStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import {
  calculateOverallScore,
  extractAnalysisMetricScores,
} from '../scoring/scoring-engine';
import { TrainingDiagnosisService } from './training-diagnosis.service';
import { TrainingRecommendationService } from './training-recommendation.service';
import { TrainingEngineInput, TrainingProfileInput } from './types/training-input.type';
import { PersistedTrainingPlan } from './types/training-plan.type';

type TrainingPlanRecord = Prisma.TrainingPlanGetPayload<Record<string, never>>;

@Injectable()
export class TrainingEngineService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trainingDiagnosisService: TrainingDiagnosisService,
    private readonly trainingRecommendationService: TrainingRecommendationService,
  ) {}

  async generatePlan(userId: string): Promise<PersistedTrainingPlan> {
    const input = await this.buildInput(userId);
    const diagnosis = this.trainingDiagnosisService.diagnose(input);
    const recommendation = this.trainingRecommendationService.recommend(
      input.profile,
      diagnosis,
    );

    const plan = await this.prisma.$transaction(async (transaction) => {
      const activePlan = await transaction.trainingPlan.findFirst({
        where: {
          userId,
          status: TrainingPlanStatus.ACTIVE,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      const latestPlan = await transaction.trainingPlan.findFirst({
        where: { userId },
        orderBy: {
          version: 'desc',
        },
      });

      if (activePlan) {
        await transaction.trainingPlan.updateMany({
          where: {
            userId,
            status: TrainingPlanStatus.ACTIVE,
          },
          data: {
            status: TrainingPlanStatus.SUPERSEDED,
          },
        });
      }

      return transaction.trainingPlan.create({
        data: {
          userId,
          status: TrainingPlanStatus.ACTIVE,
          generatedFromRange: diagnosis.generatedFromRange,
          mainWeakness: diagnosis.mainWeakness,
          mainStrength: diagnosis.mainStrength,
          focusArea: recommendation.focusArea,
          priority: recommendation.priority,
          trend: recommendation.trend,
          intensity: recommendation.intensity,
          dailyPlanJson:
            recommendation.dailyTrainingPlan as unknown as Prisma.InputJsonValue,
          weeklyPlanJson:
            recommendation.weeklyFocusPlan as unknown as Prisma.InputJsonValue,
          microGoal: recommendation.microGoal,
          justification: recommendation.justification,
          version: (latestPlan?.version ?? 0) + 1,
        },
      });
    });

    return this.mapPlan(plan, diagnosis.sampleSize, diagnosis.isOnboarding);
  }

  async getCurrentPlan(userId: string): Promise<PersistedTrainingPlan> {
    const currentPlan = await this.prisma.trainingPlan.findFirst({
      where: {
        userId,
        status: TrainingPlanStatus.ACTIVE,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!currentPlan) {
      return this.generatePlan(userId);
    }

    const sampleSize = await this.prisma.analysis.count({
      where: {
        processingStatus: AnalysisProcessingStatus.COMPLETED,
        match: {
          userId,
        },
      },
    });

    return this.mapPlan(
      currentPlan,
      Math.min(sampleSize, 5),
      currentPlan.generatedFromRange === 'onboarding',
    );
  }

  private async buildInput(userId: string): Promise<TrainingEngineInput> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        currentRank: true,
        targetRank: true,
        currentGoal: true,
        mainAgents: true,
        mainRole: true,
        currentFocus: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const analyses = await this.prisma.analysis.findMany({
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
      take: 5,
    });

    return {
      profile: this.mapProfile(user),
      analyses: analyses.map((analysis) => ({
        analysisId: analysis.id,
        matchId: analysis.matchId,
        matchDate: analysis.match.matchDate,
        deathsFirst: analysis.deathsFirst ?? 0,
        entryKills: analysis.entryKills ?? 0,
        avgCrosshairScore: analysis.avgCrosshairScore ?? 0,
        utilityUsageScore: analysis.utilityUsageScore ?? 0,
        positioningScore: analysis.positioningScore ?? 0,
        overallScore: calculateOverallScore(analysis),
        metricScores: extractAnalysisMetricScores(analysis),
      })),
    };
  }

  private mapProfile(user: {
    id: string;
    currentRank: string | null;
    targetRank: string | null;
    currentGoal: string | null;
    mainAgents: string[];
    mainRole: string | null;
    currentFocus: string | null;
  }): TrainingProfileInput {
    return {
      userId: user.id,
      currentRank: user.currentRank,
      targetRank: user.targetRank,
      currentGoal: user.currentGoal,
      mainAgents: user.mainAgents ?? [],
      mainRole: user.mainRole,
      currentFocus: user.currentFocus,
    };
  }

  private mapPlan(
    plan: TrainingPlanRecord,
    sampleSize: number,
    isOnboarding: boolean,
  ): PersistedTrainingPlan {
    return {
      id: plan.id,
      userId: plan.userId,
      status: plan.status,
      version: plan.version,
      mainWeakness: plan.mainWeakness,
      mainStrength: plan.mainStrength,
      focusArea: plan.focusArea,
      priority: plan.priority as PersistedTrainingPlan['priority'],
      trend: plan.trend as PersistedTrainingPlan['trend'],
      intensity: plan.intensity as PersistedTrainingPlan['intensity'],
      dailyTrainingPlan:
        plan.dailyPlanJson as unknown as PersistedTrainingPlan['dailyTrainingPlan'],
      weeklyFocusPlan:
        plan.weeklyPlanJson as unknown as PersistedTrainingPlan['weeklyFocusPlan'],
      microGoal: plan.microGoal,
      justification: plan.justification,
      generatedFromRange: plan.generatedFromRange ?? 'onboarding',
      sampleSize,
      isOnboarding,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    };
  }
}
