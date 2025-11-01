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

  // MinIO Configuration
  @IsString()
  @IsOptional()
  MINIO_ENDPOINT: string;

  @IsNumber()
  @IsOptional()
  MINIO_PORT: number;

  @IsString()
  @IsOptional()
  MINIO_ACCESS_KEY: string;

  @IsString()
  @IsOptional()
  MINIO_SECRET_KEY: string;

  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  @IsOptional()
  MINIO_USE_SSL: boolean;

  @IsString()
  @IsOptional()
  MINIO_BUCKET: string;

  // File Upload Configuration
  @IsNumber()
  @IsOptional()
  MAX_FILE_SIZE: number;

  @IsString()
  @IsOptional()
  ALLOWED_FILE_TYPES: string;
}

export function validate(config: Record<string, unknown>) {
  const transformedConfig = {
    ...config,
    PORT: config.PORT ? parseInt(config.PORT as string, 10) : undefined,
    MINIO_PORT: config.MINIO_PORT ? parseInt(config.MINIO_PORT as string, 10) : undefined,
    MAX_FILE_SIZE: config.MAX_FILE_SIZE ? parseInt(config.MAX_FILE_SIZE as string, 10) : undefined,
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