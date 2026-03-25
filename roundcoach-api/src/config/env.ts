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
