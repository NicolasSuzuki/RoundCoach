import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RiotContentEntity } from '../entities/riot-content.entity';
import { RiotContentService } from '../services/riot-content.service';

@ApiTags('Riot Content')
@Controller('riot-content')
export class RiotContentController {
  constructor(private readonly riotContentService: RiotContentService) {}

  @Get()
  @ApiOperation({ summary: 'Lista mapas e agentes oficiais do VALORANT' })
  @ApiOkResponse({ type: RiotContentEntity })
  async getContent(@Query('locale') locale?: string) {
    const content = await this.riotContentService.getContent(locale ?? 'pt-BR');
    return { data: new RiotContentEntity(content) };
  }
}
