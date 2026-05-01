import { plainToInstance } from 'class-transformer';
import {
  IsIn,
  IsInt,
  Matches,
  IsOptional,
  IsString,
  Min,
  validateSync,
} from 'class-validator';

class EnvironmentVariables {
  @IsOptional()
  @IsInt()
  @Min(1)
  PORT?: number;

  @IsString()
  DATABASE_URL!: string;

  @IsString()
  JWT_SECRET!: string;

  @IsString()
  JWT_EXPIRES_IN!: string;

  @IsString()
  APP_NAME!: string;

  @IsString()
  CORS_ORIGIN!: string;

  @IsIn(['stub', 'bullmq'])
  QUEUE_PROVIDER!: 'stub' | 'bullmq';

  @IsOptional()
  @Matches(/^rediss?:\/\/.+$/)
  REDIS_URL?: string;

  @IsOptional()
  @IsString()
  QUEUE_NAME?: string;

  @IsOptional()
  @IsString()
  INTERNAL_API_TOKEN?: string;

  @IsOptional()
  @IsString()
  RIOT_API_KEY?: string;

  @IsOptional()
  @IsString()
  RIOT_API_REGION?: string;

  @IsOptional()
  @IsString()
  OPENAI_API_KEY?: string;

  @IsOptional()
  @IsString()
  OPENAI_MODEL?: string;

  @IsOptional()
  @IsIn(['true', 'false'])
  OPENAI_COACH_WRITER_ENABLED?: 'true' | 'false';

  @IsOptional()
  @IsIn(['openai', 'ollama'])
  COACH_WRITER_PROVIDER?: 'openai' | 'ollama';

  @IsOptional()
  @IsString()
  COACH_WRITER_BASE_URL?: string;

  @IsOptional()
  @IsString()
  COACH_WRITER_API_KEY?: string;

  @IsOptional()
  @IsString()
  COACH_WRITER_MODEL?: string;

  @IsOptional()
  @IsIn(['true', 'false'])
  COACH_WRITER_ENABLED?: 'true' | 'false';
}

export function validateEnv(config: Record<string, unknown>): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
