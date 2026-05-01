import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { TrainingDiagnosisService } from './training-diagnosis.service';
import { TrainingEngineService } from './training-engine.service';
import { TrainingRecommendationService } from './training-recommendation.service';

@Module({
  imports: [PrismaModule],
  providers: [
    TrainingDiagnosisService,
    TrainingRecommendationService,
    TrainingEngineService,
  ],
  exports: [TrainingEngineService, TrainingDiagnosisService, TrainingRecommendationService],
})
export class TrainingEngineModule {}
