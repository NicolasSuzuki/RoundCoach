import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthEntity } from '../entities/health.entity';
import { HealthService } from '../services/health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Healthcheck simples da API' })
  @ApiOkResponse({ type: HealthEntity })
  async health() {
    return { data: this.healthService.health() };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness simples da API' })
  @ApiOkResponse({ type: HealthEntity })
  async ready() {
    return { data: await this.healthService.ready() };
  }
}
