import { Module } from '@nestjs/common';
import { TrainingEngineModule } from '../../domain/training-engine/training-engine.module';
import { TrainingPlansController } from './controllers/training-plans.controller';

@Module({
  imports: [TrainingEngineModule],
  controllers: [TrainingPlansController],
})
export class TrainingPlansModule {}
