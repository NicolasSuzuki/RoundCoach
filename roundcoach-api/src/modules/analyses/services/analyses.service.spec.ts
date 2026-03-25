import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AnalysisProcessingStatus, VodStatus } from '@prisma/client';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { VodsRepository } from '../../vods/repositories/vods.repository';
import { AnalysesRepository } from '../repositories/analyses.repository';
import { AnalysesService } from './analyses.service';

describe('AnalysesService', () => {
  let analysesRepository: jest.Mocked<AnalysesRepository>;
  let vodsRepository: jest.Mocked<VodsRepository>;
  let prismaService: jest.Mocked<PrismaService>;
  let service: AnalysesService;

  beforeEach(() => {
    analysesRepository = {
      findByMatchIdWithOwnership: jest.fn(),
      upsertByMatchId: jest.fn(),
      findByIdWithOwnership: jest.fn(),
    } as never;

    vodsRepository = {
      findById: jest.fn(),
    } as never;

    prismaService = {
      $transaction: jest.fn(),
    } as never;

    service = new AnalysesService(analysesRepository, vodsRepository, prismaService);
  });

  it('applies a completed internal result and updates vod status to PROCESSED', async () => {
    vodsRepository.findById.mockResolvedValue({
      id: 'vod-1',
      matchId: 'match-1',
    } as never);

    analysesRepository.findByMatchIdWithOwnership.mockResolvedValue({
      id: 'analysis-1',
      match: { userId: 'user-1' },
    } as never);

    const analysisUpdateMock = jest.fn().mockResolvedValue({
      id: 'analysis-1',
      processingStatus: AnalysisProcessingStatus.COMPLETED,
    });
    const vodUpdateMock = jest.fn().mockResolvedValue({
      id: 'vod-1',
      status: VodStatus.PROCESSED,
    });

    prismaService.$transaction.mockImplementation(async (callback) => {
      return callback({
        analysis: {
          update: analysisUpdateMock,
        },
        vod: {
          update: vodUpdateMock,
        },
      } as never);
    });

    const result = await service.applyInternalResult({
      vodId: 'vod-1',
      matchId: 'match-1',
      processingStatus: 'COMPLETED',
      deathsFirst: 4,
      entryKills: 7,
      crosshairScore: 72.4,
      utilityUsageScore: 68.9,
      positioningScore: 74.2,
      summary: 'Worker completed the analysis.',
    });

    expect(analysisUpdateMock).toHaveBeenCalledWith({
      where: { matchId: 'match-1' },
      data: expect.objectContaining({
        vodId: 'vod-1',
        processingStatus: 'COMPLETED',
        deathsFirst: 4,
        entryKills: 7,
        avgCrosshairScore: 72.4,
        utilityUsageScore: 68.9,
        positioningScore: 74.2,
        summary: 'Worker completed the analysis.',
      }),
    });
    expect(vodUpdateMock).toHaveBeenCalledWith({
      where: { id: 'vod-1' },
      data: { status: VodStatus.PROCESSED },
    });
    expect(result).toEqual({
      analysis: {
        id: 'analysis-1',
        processingStatus: AnalysisProcessingStatus.COMPLETED,
      },
      vod: {
        id: 'vod-1',
        status: VodStatus.PROCESSED,
      },
    });
  });

  it('throws when the vod does not belong to the provided match', async () => {
    vodsRepository.findById.mockResolvedValue({
      id: 'vod-2',
      matchId: 'match-x',
    } as never);

    await expect(
      service.applyInternalResult({
        vodId: 'vod-2',
        matchId: 'match-y',
        processingStatus: 'COMPLETED',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws when the analysis does not exist for the match', async () => {
    vodsRepository.findById.mockResolvedValue({
      id: 'vod-3',
      matchId: 'match-3',
    } as never);
    analysesRepository.findByMatchIdWithOwnership.mockResolvedValue(null);

    await expect(
      service.applyInternalResult({
        vodId: 'vod-3',
        matchId: 'match-3',
        processingStatus: 'FAILED',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
