import { registerAs } from '@nestjs/config';

export const internalConfig = registerAs('internal', () => ({
  apiToken: process.env.INTERNAL_API_TOKEN ?? 'roundcoach-internal-dev-token',
}));
