import { Worker } from 'bullmq';
import { env } from '../config/env';
import { processVodJob } from '../jobs/process-vod.job';
import { ProcessVodJob } from '../types/process-vod-job.type';
import { bullMqConnection } from './redis';

export function createVodProcessingWorker() {
  const worker = new Worker<ProcessVodJob>(env.queueName, processVodJob, {
    connection: bullMqConnection,
    concurrency: env.workerConcurrency,
  });

  worker.on('ready', () => {
    console.log(
      `[worker] ready queue=${env.queueName} concurrency=${env.workerConcurrency}`,
    );
  });

  worker.on('completed', (job) => {
    console.log(`[worker] completed jobId=${job.id}`);
  });

  worker.on('failed', (job, error) => {
    console.error(
      `[worker] failed jobId=${job?.id ?? 'unknown'} error=${error.message}`,
    );
  });

  return worker;
}
