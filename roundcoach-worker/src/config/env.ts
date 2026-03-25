import { config } from 'dotenv';

config();

function getRequired(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getNumber(name: string, fallback: number): number {
  const rawValue = process.env[name];

  if (!rawValue) {
    return fallback;
  }

  const parsedValue = Number(rawValue);

  if (Number.isNaN(parsedValue)) {
    throw new Error(`Invalid numeric environment variable: ${name}`);
  }

  return parsedValue;
}

export const env = {
  port: getNumber('PORT', 3002),
  redisUrl: getRequired('REDIS_URL'),
  queueName: getRequired('QUEUE_NAME'),
  apiBaseUrl: getRequired('API_BASE_URL'),
  internalApiToken: getRequired('INTERNAL_API_TOKEN'),
  workerConcurrency: getNumber('WORKER_CONCURRENCY', 2),
  processingDelayMs: getNumber('PROCESSING_DELAY_MS', 3000),
};
