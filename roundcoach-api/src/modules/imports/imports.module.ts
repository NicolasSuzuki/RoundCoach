import { Module } from '@nestjs/common';
import { MatchAnalysisEngineModule } from '../../domain/match-analysis-engine/match-analysis-engine.module';
import { ImportsController } from './controllers/imports.controller';
import { ValorantLocalImportService } from './services/valorant-local-import.service';

@Module({
  imports: [MatchAnalysisEngineModule],
  controllers: [ImportsController],
  providers: [ValorantLocalImportService],
})
export class ImportsModule {}
