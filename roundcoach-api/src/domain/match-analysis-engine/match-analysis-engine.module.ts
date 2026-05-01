import { Module } from '@nestjs/common';
import { MatchAnalysisEngineService } from './match-analysis-engine.service';

@Module({
  providers: [MatchAnalysisEngineService],
  exports: [MatchAnalysisEngineService],
})
export class MatchAnalysisEngineModule {}
