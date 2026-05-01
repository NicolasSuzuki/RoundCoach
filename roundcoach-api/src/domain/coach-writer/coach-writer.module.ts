import { Module } from '@nestjs/common';
import { CoachWriterService } from './coach-writer.service';

@Module({
  providers: [CoachWriterService],
  exports: [CoachWriterService],
})
export class CoachWriterModule {}
