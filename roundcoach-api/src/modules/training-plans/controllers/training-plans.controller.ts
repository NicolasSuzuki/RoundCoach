import { Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../../../common/types/authenticated-user.type';
import { TrainingEngineService } from '../../../domain/training-engine/training-engine.service';
import { TrainingPlanEntity } from '../entities/training-plan.entity';

@ApiTags('Training Plans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('training-plans')
export class TrainingPlansController {
  constructor(private readonly trainingEngineService: TrainingEngineService) {}

  @Post('generate')
  @HttpCode(200)
  @ApiOperation({ summary: 'Gera um novo plano de treino para o usuario autenticado' })
  @ApiOkResponse({ type: TrainingPlanEntity })
  async generate(@CurrentUser() user: AuthenticatedUser) {
    const plan = await this.trainingEngineService.generatePlan(user.id);
    return { data: new TrainingPlanEntity(plan as TrainingPlanEntity) };
  }

  @Get('current')
  @ApiOperation({
    summary:
      'Retorna o plano de treino ativo do usuario autenticado. Se nao existir, gera sob demanda.',
  })
  @ApiOkResponse({ type: TrainingPlanEntity })
  async getCurrent(@CurrentUser() user: AuthenticatedUser) {
    const plan = await this.trainingEngineService.getCurrentPlan(user.id);
    return { data: new TrainingPlanEntity(plan as TrainingPlanEntity) };
  }
}
