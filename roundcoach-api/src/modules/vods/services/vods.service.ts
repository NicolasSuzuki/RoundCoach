import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Vod, VodStatus } from '@prisma/client';
import { PaginatedResult } from '../../../common/types/paginated-result.type';
import { QueueService } from '../../../integrations/queue/queue.service';
import { AnalysesService } from '../../analyses/services/analyses.service';
import { MatchesService } from '../../matches/services/matches.service';
import { CreateVodDto } from '../dtos/create-vod.dto';
import { ListVodsQueryDto } from '../dtos/list-vods-query.dto';
import { UpdateVodDto } from '../dtos/update-vod.dto';
import { VodsRepository } from '../repositories/vods.repository';

@Injectable()
export class VodsService {
  constructor(
    private readonly vodsRepository: VodsRepository,
    private readonly matchesService: MatchesService,
    private readonly analysesService: AnalysesService,
    private readonly queueService: QueueService,
  ) {}

  async create(userId: string, dto: CreateVodDto): Promise<Vod> {
    if (dto.matchId) {
      await this.matchesService.findByIdForUser(dto.matchId, userId);
    }

    return this.vodsRepository.create({
      ...dto,
      userId,
      status: VodStatus.UPLOADED,
    });
  }

  async findAllByUser(
    userId: string,
    query: ListVodsQueryDto,
  ): Promise<PaginatedResult<Vod>> {
    return this.vodsRepository.findAllByUserId(userId, query);
  }

  async findByIdForUser(id: string, userId: string): Promise<Vod> {
    const vod = await this.vodsRepository.findById(id);

    if (!vod) {
      throw new NotFoundException('VOD not found');
    }

    if (vod.userId !== userId) {
      throw new ForbiddenException('You do not have access to this VOD');
    }

    return vod;
  }

  async update(id: string, userId: string, dto: UpdateVodDto): Promise<Vod> {
    const vod = await this.findByIdForUser(id, userId);

    if (dto.matchId) {
      await this.matchesService.findByIdForUser(dto.matchId, userId);
    }

    return this.vodsRepository.update(vod.id, dto);
  }

  async process(id: string, userId: string) {
    const vod = await this.findByIdForUser(id, userId);

    if (!vod.matchId) {
      throw new BadRequestException(
        'VOD must be linked to a match before processing',
      );
    }

    if (vod.status === VodStatus.PROCESSING) {
      throw new BadRequestException('VOD is already processing');
    }

    const match = await this.matchesService.findByIdForUser(vod.matchId, userId);

    const updatedVod = await this.vodsRepository.update(vod.id, {
      status: VodStatus.PROCESSING,
    });

    const analysis = await this.analysesService.upsertProcessingForMatch({
      matchId: vod.matchId,
      vodId: vod.id,
    });

    await this.queueService.enqueueVodProcessing({
      vodId: vod.id,
      matchId: vod.matchId,
      userId,
      map: match.map,
      agent: match.agent,
      result: match.result,
      score: match.score,
    });

    return {
      message: 'VOD processing scheduled successfully',
      vod: updatedVod,
      analysis,
    };
  }
}
