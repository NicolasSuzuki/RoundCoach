import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../../../common/types/authenticated-user.type';
import { DashboardEvolutionPointEntity } from '../entities/dashboard-evolution-point.entity';
import { DashboardSummaryEntity } from '../entities/dashboard-summary.entity';
import { DashboardTrainingPlanEntity } from '../entities/dashboard-training-plan.entity';
import { DashboardService } from '../services/dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Retorna o resumo do dashboard do usuario autenticado' })
  @ApiOkResponse({ type: DashboardSummaryEntity })
  async getSummary(@CurrentUser() user: AuthenticatedUser) {
    const summary = await this.dashboardService.getSummary(user.id);
    return { data: new DashboardSummaryEntity(summary) };
  }

  @Get('evolution')
  @ApiOperation({ summary: 'Retorna a evolucao de score por partida' })
  @ApiOkResponse({ type: DashboardEvolutionPointEntity, isArray: true })
  async getEvolution(@CurrentUser() user: AuthenticatedUser) {
    const evolution = await this.dashboardService.getEvolution(user.id);
    return {
      data: evolution.map((item) => new DashboardEvolutionPointEntity(item)),
    };
  }

  @Get('training-plan')
  @ApiOperation({ summary: 'Retorna o plano de treino atual pronto para o dashboard' })
  @ApiOkResponse({ type: DashboardTrainingPlanEntity })
  async getTrainingPlan(@CurrentUser() user: AuthenticatedUser) {
    const trainingPlan = await this.dashboardService.getTrainingPlan(user.id);
    return {
      data: new DashboardTrainingPlanEntity(
        trainingPlan as DashboardTrainingPlanEntity,
      ),
    };
  }
}
