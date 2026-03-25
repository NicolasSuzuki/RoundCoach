import { Global, Module } from '@nestjs/common';
import { AnalysesModule } from '../../modules/analyses/analyses.module';
import { QueueService } from './queue.service';

@Global()
@Module({
  imports: [AnalysesModule],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}
