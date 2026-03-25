import { registerAs } from '@nestjs/config';

export const riotConfig = registerAs('riot', () => ({
  apiKey: process.env.RIOT_API_KEY ?? '',
  apiRegion: process.env.RIOT_API_REGION ?? 'eu',
}));
