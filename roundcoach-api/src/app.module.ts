import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from './config/app.config';
import { authConfig } from './config/auth.config';
import { databaseConfig } from './config/database.config';
import { queueConfig } from './config/queue.config';
import { internalConfig } from './config/internal.config';
import { openaiConfig } from './config/openai.config';
import { riotConfig } from './config/riot.config';
import { validateEnv } from './config/env';
import { OwnershipGuard } from './common/guards/ownership.guard';
import { PrismaModule } from './database/prisma/prisma.module';
import { QueueModule } from './integrations/queue/queue.module';
import { AnalysesModule } from './modules/analyses/analyses.module';
import { AuthModule } from './modules/auth/auth.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { HealthModule } from './modules/health/health.module';
import { ImportsModule } from './modules/imports/imports.module';
import { MatchesModule } from './modules/matches/matches.module';
import { RiotContentModule } from './modules/riot-content/riot-content.module';
import { TrainingPlansModule } from './modules/training-plans/training-plans.module';
import { UsersModule } from './modules/users/users.module';
import { VodsModule } from './modules/vods/vods.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [
        appConfig,
        authConfig,
        databaseConfig,
        queueConfig,
        internalConfig,
        openaiConfig,
        riotConfig,
      ],
      validate: validateEnv,
    }),
    PrismaModule,
    QueueModule,
    UsersModule,
    AuthModule,
    DashboardModule,
    ImportsModule,
    MatchesModule,
    VodsModule,
    AnalysesModule,
    TrainingPlansModule,
    RiotContentModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: OwnershipGuard,
    },
  ],
})
export class AppModule {}
