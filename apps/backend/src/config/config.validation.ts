import { Transform } from 'class-transformer';
import { IsString, IsNumber, IsOptional, IsArray, IsBoolean, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsString()
  @IsOptional()
  NODE_ENV: string;

  @IsOptional()
  PORT: number;

  @IsString()
  @IsOptional()
  CORS_ORIGIN: string;

  @IsString()
  @IsOptional()
  DATABASE_URL: string;

  @IsString()
  @IsOptional()
  REDIS_URL: string;

  @IsString()
  @IsOptional()
  JWT_SECRET: string;

  @IsString()
  @IsOptional()
  JWT_EXPIRES_IN: string;

  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  @IsOptional()
  LOG_LEVEL: boolean;
}

export function validate(config: Record<string, unknown>) {
  const transformedConfig = {
    ...config,
    PORT: config.PORT ? parseInt(config.PORT as string, 10) : undefined,
  };
  
  const validatedConfig = Object.assign(new EnvironmentVariables(), transformedConfig);
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}