import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Analysis,
  AnalysisProcessingStatus,
  MatchResult,
  Prisma,
  VodStatus,
} from '@prisma/client';
import {
  FakeAnalysisSimulationInput,
  simulateFakeAnalysis,
} from '../../../domain/simulation/fake-analysis-simulator';
import { buildAnalysisInsights } from '../../../domain/insight-engine/insight-engine';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { VodsRepository } from '../../vods/repositories/vods.repository';
import { InternalAnalysisResultDto } from '../dtos/internal-analysis-result.dto';
import { AnalysesRepository } from '../repositories/analyses.repository';

type AnalysisWithOwnership = Prisma.AnalysisGetPayload<{
  include: {
    match: {
      select: {
        userId: true;
      };
    };
  };
}>;

@Injectable()
export class AnalysesService {
  constructor(
    private readonly analysesRepository: AnalysesRepository,
    private readonly vodsRepository: VodsRepository,
    private readonly prisma: PrismaService,
  ) {}

  async findByIdForUser(id: string, userId: string): Promise<Analysis> {
    const analysis = (await this.analysesRepository.findByIdWithOwnership(
      id,
    )) as AnalysisWithOwnership | null;

    if (!analysis) {
      throw new NotFoundException('Analysis not found');
    }

    if (analysis.match.userId !== userId) {
      throw new ForbiddenException('You do not have access to this analysis');
    }

    const { match, ...analysisData } = analysis;
    void match;
    return analysisData;
  }

  async findByMatchIdForUser(
    matchId: string,
    userId: string,
  ): Promise<Analysis> {
    const analysis = (await this.analysesRepository.findByMatchIdWithOwnership(
      matchId,
    )) as AnalysisWithOwnership | null;

    if (!analysis) {
      throw new NotFoundException('Analysis not found');
    }

    if (analysis.match.userId !== userId) {
      throw new ForbiddenException('You do not have access to this analysis');
    }

    const { match, ...analysisData } = analysis;
    void match;
    return analysisData;
  }

  async upsertProcessingForMatch(data: {
    matchId: string;
    vodId: string;
  }): Promise<Analysis> {
    return this.analysesRepository.upsertByMatchId(data.matchId, {
      vodId: data.vodId,
      processingStatus: AnalysisProcessingStatus.PROCESSING,
    });
  }

  async applyInternalResult(dto: InternalAnalysisResultDto) {
    const vod = await this.vodsRepository.findById(dto.vodId);

    if (!vod) {
      throw new NotFoundException('VOD not found');
    }

    if (vod.matchId !== dto.matchId) {
      throw new BadRequestException('VOD does not belong to the provided match');
    }

    const existingAnalysis = await this.analysesRepository.findByMatchIdWithOwnership(
      dto.matchId,
    );

    if (!existingAnalysis) {
      throw new NotFoundException('Analysis not found for this match');
    }

    const vodStatus =
      dto.processingStatus === AnalysisProcessingStatus.COMPLETED
        ? VodStatus.PROCESSED
        : VodStatus.FAILED;

    return this.prisma.$transaction(async (transaction) => {
      const completedInsights =
        dto.processingStatus === AnalysisProcessingStatus.COMPLETED &&
        dto.deathsFirst != null &&
        dto.entryKills != null &&
        dto.crosshairScore != null &&
        dto.utilityUsageScore != null &&
        dto.positioningScore != null
          ? buildAnalysisInsights({
              deathsFirst: dto.deathsFirst,
              entryKills: dto.entryKills,
              avgCrosshairScore: dto.crosshairScore,
              utilityUsageScore: dto.utilityUsageScore,
              positioningScore: dto.positioningScore,
            })
          : null;

      const analysis = await transaction.analysis.update({
        where: { matchId: dto.matchId },
        data: {
          vodId: dto.vodId,
          processingStatus: dto.processingStatus,
          deathsFirst:
            dto.processingStatus === AnalysisProcessingStatus.COMPLETED
              ? dto.deathsFirst
              : null,
          entryKills:
            dto.processingStatus === AnalysisProcessingStatus.COMPLETED
              ? dto.entryKills
              : null,
          avgCrosshairScore:
            dto.processingStatus === AnalysisProcessingStatus.COMPLETED
              ? dto.crosshairScore
              : null,
          utilityUsageScore:
            dto.processingStatus === AnalysisProcessingStatus.COMPLETED
              ? dto.utilityUsageScore
              : null,
          positioningScore:
            dto.processingStatus === AnalysisProcessingStatus.COMPLETED
              ? dto.positioningScore
              : null,
          summary:
            dto.summary ??
            (dto.processingStatus === AnalysisProcessingStatus.COMPLETED
              ? completedInsights?.summary ??
                'Analysis completed successfully with deterministic coaching output.'
              : 'Analysis processing failed.'),
        },
      });

      const updatedVod = await transaction.vod.update({
        where: { id: dto.vodId },
        data: {
          status: vodStatus,
        },
      });

      return {
        analysis,
        vod: updatedVod,
      };
    });
  }

  async completeWithFakeResult(data: {
    vodId: string;
    matchId: string;
    userId: string;
    map: string;
    agent: string;
    result: MatchResult;
    score: string;
  }) {
    const simulated = simulateFakeAnalysis(
      data as FakeAnalysisSimulationInput,
    );

    return this.applyInternalResult({
      vodId: data.vodId,
      matchId: data.matchId,
      processingStatus: AnalysisProcessingStatus.COMPLETED,
      deathsFirst: simulated.deathsFirst,
      entryKills: simulated.entryKills,
      crosshairScore: simulated.crosshairScore,
      utilityUsageScore: simulated.utilityUsageScore,
      positioningScore: simulated.positioningScore,
    });
  }
}
