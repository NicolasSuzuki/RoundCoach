import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RequireOwnership } from '../../../common/decorators/ownership.decorator';
import { InternalTokenGuard } from '../../../common/guards/internal-token.guard';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../../../common/types/authenticated-user.type';
import { InternalAnalysisResultDto } from '../dtos/internal-analysis-result.dto';
import { AnalysisEntity } from '../entities/analysis.entity';
import { AnalysisResultResponseEntity } from '../entities/analysis-result-response.entity';
import { AnalysesService } from '../services/analyses.service';

@ApiTags('Analyses')
@ApiBearerAuth()
@Controller()
export class AnalysesController {
  constructor(private readonly analysesService: AnalysesService) {}

  @Get('analyses/:id')
  @UseGuards(JwtAuthGuard)
  @RequireOwnership('analysis')
  @ApiOperation({ summary: 'Consulta uma analise por id' })
  @ApiOkResponse({ type: AnalysisEntity })
  async findById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    const analysis = await this.analysesService.findByIdForUser(id, user.id);
    return { data: new AnalysisEntity(analysis) };
  }

  @Get('matches/:matchId/analysis')
  @UseGuards(JwtAuthGuard)
  @RequireOwnership('match', 'matchId')
  @ApiOperation({ summary: 'Consulta a analise de uma partida' })
  @ApiOkResponse({ type: AnalysisEntity })
  async findByMatchId(
    @CurrentUser() user: AuthenticatedUser,
    @Param('matchId') matchId: string,
  ) {
    const analysis = await this.analysesService.findByMatchIdForUser(
      matchId,
      user.id,
    );
    return { data: new AnalysisEntity(analysis) };
  }

  @Post('internal/analysis-result')
  @UseGuards(InternalTokenGuard)
  @ApiTags('Internal')
  @ApiHeader({
    name: 'x-internal-token',
    description: 'Shared token used by the worker or local stub processor.',
  })
  @ApiOperation({ summary: 'Recebe o resultado interno de processamento da analysis' })
  @ApiOkResponse({ type: AnalysisResultResponseEntity })
  async applyInternalResult(@Body() dto: InternalAnalysisResultDto) {
    const result = await this.analysesService.applyInternalResult(dto);
    return {
      data: new AnalysisResultResponseEntity({
        message: 'Analysis result applied successfully',
        analysis: result.analysis,
        vod: result.vod,
      }),
    };
  }
}
