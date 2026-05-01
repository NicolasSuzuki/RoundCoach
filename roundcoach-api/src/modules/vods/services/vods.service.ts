import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createReadStream, existsSync, mkdirSync, unlinkSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { Vod, VodStatus } from '@prisma/client';
import { PaginatedResult } from '../../../common/types/paginated-result.type';
import { QueueService } from '../../../integrations/queue/queue.service';
import { AnalysesService } from '../../analyses/services/analyses.service';
import { MatchesService } from '../../matches/services/matches.service';
import { CreateVodDto } from '../dtos/create-vod.dto';
import { ListVodsQueryDto } from '../dtos/list-vods-query.dto';
import { UploadVodDto } from '../dtos/upload-vod.dto';
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

  async createFromUpload(
    userId: string,
    dto: UploadVodDto,
    file: Express.Multer.File,
  ): Promise<Vod> {
    if (!dto.matchId) {
      throw new BadRequestException('matchId is required for file upload');
    }

    await this.matchesService.findByIdForUser(dto.matchId, userId);

    const fileName = dto.fileName?.trim() || file.originalname;
    const storagePath = this.normalizeStoragePath(file.path);

    const created = await this.vodsRepository.create({
      userId,
      matchId: dto.matchId,
      fileName,
      fileUrl: '',
      storagePath,
      durationSeconds: dto.durationSeconds,
      status: VodStatus.UPLOADED,
    });

    return this.vodsRepository.update(created.id, {
      fileUrl: this.buildVodStreamUrl(created.id),
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

  async replaceUpload(
    id: string,
    userId: string,
    dto: UploadVodDto,
    file: Express.Multer.File,
  ): Promise<Vod> {
    const vod = await this.findByIdForUser(id, userId);

    if (dto.matchId && dto.matchId !== vod.matchId) {
      await this.matchesService.findByIdForUser(dto.matchId, userId);
    }

    const newStoragePath = this.normalizeStoragePath(file.path);
    const oldStoragePath = vod.storagePath ?? null;

    const updated = await this.vodsRepository.update(vod.id, {
      matchId: dto.matchId ?? vod.matchId,
      fileName: dto.fileName?.trim() || file.originalname,
      durationSeconds: dto.durationSeconds ?? vod.durationSeconds,
      fileUrl: this.buildVodStreamUrl(vod.id),
      storagePath: newStoragePath,
      status: VodStatus.UPLOADED,
    });

    if (oldStoragePath && oldStoragePath !== newStoragePath && existsSync(oldStoragePath)) {
      unlinkSync(oldStoragePath);
    }

    return updated;
  }

  async getFileStreamForUser(id: string, userId: string) {
    const vod = await this.findByIdForUser(id, userId);

    if (!vod.storagePath) {
      throw new NotFoundException('This VOD does not have an uploaded local file');
    }

    if (!existsSync(vod.storagePath)) {
      throw new NotFoundException('Uploaded file not found on server');
    }

    return {
      stream: createReadStream(vod.storagePath),
      fileName: vod.fileName,
      contentType: this.resolveContentType(vod.fileName),
    };
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

  private buildVodStreamUrl(vodId: string): string {
    return `/api/v1/vods/${vodId}/file`;
  }

  private normalizeStoragePath(filePath: string): string {
    const absolute =
      filePath.includes(':') || filePath.startsWith('/')
        ? filePath
        : join(process.cwd(), filePath);
    const directory = dirname(absolute);
    mkdirSync(directory, { recursive: true });
    return absolute;
  }

  private resolveContentType(fileName: string): string {
    const extension = extname(fileName).toLowerCase();

    if (extension === '.mp4') {
      return 'video/mp4';
    }

    return 'application/octet-stream';
  }
}
