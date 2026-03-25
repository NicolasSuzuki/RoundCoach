import { Queue } from 'bullmq';
import { env } from '../config/env';
import { ProcessVodJob } from '../types/process-vod-job.type';
import { bullMqConnection } from './redis';

export const vodProcessingQueue = new Queue<ProcessVodJob, void, string>(
  env.queueName,
  {
    connection: bullMqConnection,
  },
);
