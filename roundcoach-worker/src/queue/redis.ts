import { env } from '../config/env';

const redisUrl = new URL(env.redisUrl);

export const bullMqConnection = {
  host: redisUrl.hostname,
  port: Number(redisUrl.port || 6379),
  maxRetriesPerRequest: null as null,
  ...(redisUrl.password ? { password: redisUrl.password } : {}),
};
