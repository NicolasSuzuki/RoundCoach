import { Module } from '@nestjs/common';
import { MatchesController } from './controllers/matches.controller';
import { MatchesRepository } from './repositories/matches.repository';
import { MatchesService } from './services/matches.service';

@Module({
  controllers: [MatchesController],
  providers: [MatchesService, MatchesRepository],
  exports: [MatchesService, MatchesRepository],
})
export class MatchesModule {}
