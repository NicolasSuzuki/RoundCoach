import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RequireOwnership } from '../../../common/decorators/ownership.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../../../common/types/authenticated-user.type';
import { CreateVodDto } from '../dtos/create-vod.dto';
import { ListVodsQueryDto } from '../dtos/list-vods-query.dto';
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

  @Post(':id/process')
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
