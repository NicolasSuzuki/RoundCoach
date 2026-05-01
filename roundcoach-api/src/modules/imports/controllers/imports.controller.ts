import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../../../common/types/authenticated-user.type';
import { ImportValorantLocalDto } from '../dtos/import-valorant-local.dto';
import { ImportResultEntity } from '../entities/import-result.entity';
import { ValorantLocalImportService } from '../services/valorant-local-import.service';

@ApiTags('Imports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('imports')
export class ImportsController {
  constructor(
    private readonly valorantLocalImportService: ValorantLocalImportService,
  ) {}

  @Post('valorant/local/matches')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Importa partidas normalizadas pelo client local do VALORANT',
  })
  @ApiOkResponse({ type: ImportResultEntity })
  async importValorantLocalMatches(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ImportValorantLocalDto,
  ) {
    const result = await this.valorantLocalImportService.importMatches(
      user.id,
      dto,
    );

    return { data: new ImportResultEntity(result) };
  }
}
