import { Module } from '@nestjs/common';
import { RiotContentController } from './controllers/riot-content.controller';
import { RiotContentService } from './services/riot-content.service';

@Module({
  controllers: [RiotContentController],
  providers: [RiotContentService],
  exports: [RiotContentService],
})
export class RiotContentModule {}
