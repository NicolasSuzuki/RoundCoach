import { createServer } from 'http';
import { env } from './config/env';
import { createVodProcessingWorker } from './queue/worker';

async function bootstrap() {
  const worker = createVodProcessingWorker();

  const server = createServer((request, response) => {
    if (request.url === '/health') {
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ status: 'ok' }));
      return;
    }

    response.writeHead(404, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ message: 'Not found' }));
  });

  server.listen(env.port, () => {
    console.log(
      `[worker] listening port=${env.port} queue=${env.queueName} redis=${env.redisUrl}`,
    );
  });

  const shutdown = async () => {
    console.log('[worker] shutting down');
    await worker.close();
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGINT', () => {
    void shutdown();
  });

  process.on('SIGTERM', () => {
    void shutdown();
  });
}

void bootstrap().catch((error) => {
  console.error('[worker] bootstrap failed', error);
  process.exit(1);
});
