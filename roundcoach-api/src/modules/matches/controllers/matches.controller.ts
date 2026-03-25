import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RequireOwnership } from '../../../common/decorators/ownership.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../../../common/types/authenticated-user.type';
import { CreateMatchDto } from '../dtos/create-match.dto';
import { ListMatchesQueryDto } from '../dtos/list-matches-query.dto';
import { UpdateMatchDto } from '../dtos/update-match.dto';
import { MatchEntity } from '../entities/match.entity';
import { PaginatedMatchResponseEntity } from '../entities/paginated-match-response.entity';
import { MatchesService } from '../services/matches.service';

@ApiTags('Matches')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma partida manualmente' })
  @ApiCreatedResponse({ type: MatchEntity })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateMatchDto,
  ) {
    const match = await this.matchesService.create(user.id, dto);
    return { data: new MatchEntity(match) };
  }

  @Get()
  @ApiOperation({ summary: 'Lista partidas do usuario autenticado' })
  @ApiOkResponse({ type: PaginatedMatchResponseEntity })
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListMatchesQueryDto,
  ) {
    const matches = await this.matchesService.findAllByUser(user.id, query);
    return new PaginatedMatchResponseEntity({
      data: matches.items,
      meta: matches.meta,
    });
  }

  @Get(':id')
  @RequireOwnership('match')
  @ApiOperation({ summary: 'Detalha uma partida do usuario autenticado' })
  @ApiOkResponse({ type: MatchEntity })
  async findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    const match = await this.matchesService.findByIdForUser(id, user.id);
    return { data: new MatchEntity(match) };
  }

  @Patch(':id')
  @RequireOwnership('match')
  @ApiOperation({ summary: 'Atualiza uma partida do usuario autenticado' })
  @ApiOkResponse({ type: MatchEntity })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateMatchDto,
  ) {
    const match = await this.matchesService.update(id, user.id, dto);
    return { data: new MatchEntity(match) };
  }

  @Delete(':id')
  @RequireOwnership('match')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove uma partida do usuario autenticado' })
  @ApiNoContentResponse()
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    await this.matchesService.remove(id, user.id);
  }
}
