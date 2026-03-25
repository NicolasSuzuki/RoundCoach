import { randomUUID } from 'crypto';
import { env } from '../config/env';
import { vodProcessingQueue } from '../queue/queue';

async function main() {
  const job = await vodProcessingQueue.add('vod-processing', {
    vodId: `vod-${randomUUID()}`,
    matchId: `match-${randomUUID()}`,
    userId: `user-${randomUUID()}`,
    map: 'Ascent',
    agent: 'Jett',
    result: 'WIN',
    score: '13-10',
  });

  console.log(
    `[enqueue-test] queued jobId=${job.id} queue=${env.queueName} with random payload`,
  );

  await vodProcessingQueue.close();
  process.exit(0);
}

void main().catch((error) => {
  console.error('[enqueue-test] failed', error);
  process.exit(1);
});
