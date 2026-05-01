import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiBearerAuth,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RequireOwnership } from '../../../common/decorators/ownership.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../../../common/types/authenticated-user.type';
import { CreateVodDto } from '../dtos/create-vod.dto';
import { ListVodsQueryDto } from '../dtos/list-vods-query.dto';
import { UploadVodDto } from '../dtos/upload-vod.dto';
import { UpdateVodDto } from '../dtos/update-vod.dto';
import { PaginatedVodResponseEntity } from '../entities/paginated-vod-response.entity';
import { VodProcessResponseEntity } from '../entities/vod-process-response.entity';
import { VodEntity } from '../entities/vod.entity';
import { VodsService } from '../services/vods.service';

@ApiTags('VODs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('vods')
export class VodsController {
  constructor(private readonly vodsService: VodsService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastra um VOD' })
  @ApiCreatedResponse({ type: VodEntity })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateVodDto,
  ) {
    const vod = await this.vodsService.create(user.id, dto);
    return { data: new VodEntity(vod) };
  }

  @Post('upload')
  @ApiOperation({ summary: 'Faz upload real de MP4 e cadastra o VOD' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        matchId: { type: 'string' },
        fileName: { type: 'string' },
        durationSeconds: { type: 'number' },
        file: { type: 'string', format: 'binary' },
      },
      required: ['matchId', 'file'],
    },
  })
  @ApiCreatedResponse({ type: VodEntity })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_request, _file, callback) => {
          const uploadDirectory = join(process.cwd(), 'uploads', 'vods');
          mkdirSync(uploadDirectory, { recursive: true });
          callback(null, uploadDirectory);
        },
        filename: (_request, file, callback) => {
          callback(null, `${Date.now()}-${randomUUID()}${extname(file.originalname) || '.mp4'}`);
        },
      }),
      limits: {
        fileSize: 1024 * 1024 * 1024,
      },
      fileFilter: (_request, file, callback) => {
        const extension = extname(file.originalname).toLowerCase();
        const mimeType = file.mimetype.toLowerCase();
        const isMp4 = extension === '.mp4' || mimeType === 'video/mp4';

        if (!isMp4) {
          callback(new BadRequestException('Only .mp4 files are allowed'), false);
          return;
        }

        callback(null, true);
      },
    }),
  )
  async upload(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UploadVodDto,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    if (!file) {
      throw new BadRequestException('file is required');
    }

    const vod = await this.vodsService.createFromUpload(user.id, dto, file);
    return { data: new VodEntity(vod) };
  }

  @Get()
  @ApiOperation({ summary: 'Lista VODs do usuario autenticado' })
  @ApiOkResponse({ type: PaginatedVodResponseEntity })
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListVodsQueryDto,
  ) {
    const vods = await this.vodsService.findAllByUser(user.id, query);
    return new PaginatedVodResponseEntity({
      data: vods.items,
      meta: vods.meta,
    });
  }

  @Get(':id')
  @RequireOwnership('vod')
  @ApiOperation({ summary: 'Detalha um VOD do usuario autenticado' })
  @ApiOkResponse({ type: VodEntity })
  async findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    const vod = await this.vodsService.findByIdForUser(id, user.id);
    return { data: new VodEntity(vod) };
  }

  @Post(':id/upload')
  @HttpCode(200)
  @RequireOwnership('vod')
  @ApiOperation({ summary: 'Substitui o arquivo local de um VOD existente' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        matchId: { type: 'string' },
        fileName: { type: 'string' },
        durationSeconds: { type: 'number' },
        file: { type: 'string', format: 'binary' },
      },
      required: ['file'],
    },
  })
  @ApiOkResponse({ type: VodEntity })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_request, _file, callback) => {
          const uploadDirectory = join(process.cwd(), 'uploads', 'vods');
          mkdirSync(uploadDirectory, { recursive: true });
          callback(null, uploadDirectory);
        },
        filename: (_request, file, callback) => {
          callback(null, `${Date.now()}-${randomUUID()}${extname(file.originalname) || '.mp4'}`);
        },
      }),
      limits: {
        fileSize: 1024 * 1024 * 1024,
      },
      fileFilter: (_request, file, callback) => {
        const extension = extname(file.originalname).toLowerCase();
        const mimeType = file.mimetype.toLowerCase();
        const isMp4 = extension === '.mp4' || mimeType === 'video/mp4';

        if (!isMp4) {
          callback(new BadRequestException('Only .mp4 files are allowed'), false);
          return;
        }

        callback(null, true);
      },
    }),
  )
  async replaceUpload(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UploadVodDto,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    if (!file) {
      throw new BadRequestException('file is required');
    }

    const vod = await this.vodsService.replaceUpload(id, user.id, dto, file);
    return { data: new VodEntity(vod) };
  }

  @Get(':id/file')
  @RequireOwnership('vod')
  @ApiOperation({ summary: 'Faz stream do arquivo de VOD local do usuario autenticado' })
  async streamFile(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const file = await this.vodsService.getFileStreamForUser(id, user.id);
    response.set({
      'Content-Type': file.contentType,
      'Content-Disposition': `inline; filename="${file.fileName}"`,
    });
    return new StreamableFile(file.stream);
  }

  @Post(':id/process')
  @HttpCode(200)
  @RequireOwnership('vod')
  @ApiOperation({ summary: 'Dispara o processamento assincrono do VOD' })
  @ApiOkResponse({ type: VodProcessResponseEntity })
  async process(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    const result = await this.vodsService.process(id, user.id);
    return { data: new VodProcessResponseEntity(result) };
  }

  @Patch(':id')
  @RequireOwnership('vod')
  @ApiOperation({ summary: 'Atualiza um VOD do usuario autenticado' })
  @ApiOkResponse({ type: VodEntity })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateVodDto,
  ) {
    const vod = await this.vodsService.update(id, user.id, dto);
    return { data: new VodEntity(vod) };
  }
}
