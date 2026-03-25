import { Module } from '@nestjs/common';
import { AnalysesModule } from '../analyses/analyses.module';
import { MatchesModule } from '../matches/matches.module';
import { VodsController } from './controllers/vods.controller';
import { VodsRepository } from './repositories/vods.repository';
import { VodsService } from './services/vods.service';

@Module({
  imports: [MatchesModule, AnalysesModule],
  controllers: [VodsController],
  providers: [VodsService, VodsRepository],
  exports: [VodsService, VodsRepository],
})
export class VodsModule {}
