import { Injectable } from '@nestjs/common';
import { Analysis, AnalysisProcessingStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma/prisma.service';

@Injectable()
export class AnalysesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByIdWithOwnership(id: string) {
    return this.prisma.analysis.findUnique({
      where: { id },
      include: {
        coachSnapshot: true,
        match: {
          select: {
            userId: true,
          },
        },
      },
    });
  }

  async findByMatchIdWithOwnership(matchId: string) {
    return this.prisma.analysis.findUnique({
      where: { matchId },
      include: {
        coachSnapshot: true,
        match: {
          select: {
            userId: true,
          },
        },
      },
    });
  }

  async upsertByMatchId(
    matchId: string,
    data: {
      vodId: string;
      processingStatus: AnalysisProcessingStatus;
    },
  ): Promise<Analysis> {
    return this.prisma.analysis.upsert({
      where: { matchId },
      update: data,
      create: {
        matchId,
        processingStatus: data.processingStatus,
        vodId: data.vodId,
      },
    });
  }

  async updateByMatchId(
    matchId: string,
    data: Prisma.AnalysisUncheckedUpdateInput,
  ): Promise<Analysis> {
    return this.prisma.analysis.update({
      where: { matchId },
      data,
    });
  }
}
