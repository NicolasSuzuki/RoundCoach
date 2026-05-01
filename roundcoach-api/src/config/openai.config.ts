import { registerAs } from '@nestjs/config';

export const openaiConfig = registerAs('openai', () => ({
  provider: process.env.COACH_WRITER_PROVIDER ?? 'openai',
  apiKey:
    process.env.COACH_WRITER_API_KEY ??
    process.env.OPENAI_API_KEY ??
    '',
  model: process.env.COACH_WRITER_MODEL ?? process.env.OPENAI_MODEL ?? 'gpt-5',
  baseUrl:
    process.env.COACH_WRITER_BASE_URL ?? process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1',
  enabled:
    process.env.COACH_WRITER_ENABLED === 'true' ||
    process.env.OPENAI_COACH_WRITER_ENABLED === 'true',
}));
