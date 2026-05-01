import { Module } from '@nestjs/common';
import { CoachWriterModule } from '../../domain/coach-writer/coach-writer.module';
import { PlayerDiagnosisEngineModule } from '../../domain/player-diagnosis-engine/player-diagnosis-engine.module';
import { TrainingEngineModule } from '../../domain/training-engine/training-engine.module';
import { DashboardController } from './controllers/dashboard.controller';
import { DashboardService } from './services/dashboard.service';

@Module({
  imports: [CoachWriterModule, PlayerDiagnosisEngineModule, TrainingEngineModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
