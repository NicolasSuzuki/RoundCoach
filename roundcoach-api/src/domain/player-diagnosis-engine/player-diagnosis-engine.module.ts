import { Module } from '@nestjs/common';
import { PlayerDiagnosisEngineService } from './player-diagnosis-engine.service';

@Module({
  providers: [PlayerDiagnosisEngineService],
  exports: [PlayerDiagnosisEngineService],
})
export class PlayerDiagnosisEngineModule {}
