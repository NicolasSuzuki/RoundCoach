import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { VodsRepository } from '../vods/repositories/vods.repository';
import { AnalysesController } from './controllers/analyses.controller';
import { AnalysesRepository } from './repositories/analyses.repository';
import { AnalysesService } from './services/analyses.service';

@Module({
  imports: [PrismaModule],
  controllers: [AnalysesController],
  providers: [AnalysesService, AnalysesRepository, VodsRepository],
  exports: [AnalysesService, AnalysesRepository],
})
export class AnalysesModule {}
