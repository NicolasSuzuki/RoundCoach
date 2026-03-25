import { registerAs } from '@nestjs/config';

export const queueConfig = registerAs('queue', () => ({
  provider: process.env.QUEUE_PROVIDER ?? 'stub',
  redisUrl: process.env.REDIS_URL ?? '',
  queueName: process.env.QUEUE_NAME ?? 'vod-processing',
}));
