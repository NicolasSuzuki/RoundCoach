import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  port: Number(process.env.PORT ?? 3000),
  name: process.env.APP_NAME ?? 'RoundCoach API',
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
}));
