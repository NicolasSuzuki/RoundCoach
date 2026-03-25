import { DocumentBuilder } from '@nestjs/swagger';

export function buildSwaggerConfig(appName: string) {
  return new DocumentBuilder()
    .setTitle(appName)
    .setDescription(
      'API do MVP RoundCoach para autenticação, partidas, VODs, análises e healthcheck.',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
}
