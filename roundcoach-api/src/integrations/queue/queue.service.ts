import { MatchResult } from '@prisma/client';
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { AnalysesService } from '../../modules/analyses/services/analyses.service';

export interface VodProcessingJobPayload {
  vodId: string;
  matchId: string;
  userId: string;
  map: string;
  agent: string;
  result: MatchResult;
  score: string;
}

@Injectable()
export class QueueService implements OnModuleDestroy {
  private readonly logger = new Logger(QueueService.name);
  private queue: Queue<VodProcessingJobPayload, void, string> | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly analysesService: AnalysesService,
  ) {}

  async enqueueVodProcessing(payload: VodProcessingJobPayload): Promise<void> {
    const provider = this.configService.get<string>('queue.provider', 'stub');

    if (provider === 'stub') {
      this.logger.log(
        `Queue provider=${provider} scheduled in-process fake worker for vodId=${payload.vodId}`,
      );

      setTimeout(() => {
        void this.analysesService.completeWithFakeResult(payload).catch((error) => {
          this.logger.error(
            `Stub processing failed for vodId=${payload.vodId}: ${error instanceof Error ? error.message : 'unknown error'}`,
          );
        });
      }, 250);

      return;
    }

    const queue = this.getQueue();

    await queue.add('vod-processing', payload, {
      attempts: 3,
      removeOnComplete: 100,
      removeOnFail: 100,
    });

    this.logger.log(
      `Queue provider=${provider} published vod-processing job for vodId=${payload.vodId}`,
    );
  }

  async onModuleDestroy(): Promise<void> {
    if (this.queue) {
      await this.queue.close();
    }
  }

  private getQueue(): Queue<VodProcessingJobPayload, void, string> {
    if (this.queue) {
      return this.queue;
    }

    const redisUrl = this.configService.get<string>('queue.redisUrl', '');
    const queueName = this.configService.get<string>(
      'queue.queueName',
      'vod-processing',
    );

    if (!redisUrl) {
      throw new Error('REDIS_URL is required when QUEUE_PROVIDER=bullmq');
    }

    const url = new URL(redisUrl);

    this.queue = new Queue<VodProcessingJobPayload, void, string>(queueName, {
      connection: {
        host: url.hostname,
        port: Number(url.port || 6379),
        maxRetriesPerRequest: null,
        ...(url.password ? { password: url.password } : {}),
      },
    });

    return this.queue;
  }
}
