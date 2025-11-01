import { IsString, IsNumber, IsOptional, IsArray, IsEnum, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum FileCategory {
  DOCUMENT = 'document',
  AUDIO = 'audio',
  VIDEO = 'video',
  IMAGE = 'image',
  ARCHIVE = 'archive',
  OTHER = 'other',
}

export class InitiateUploadDto {
  @ApiProperty({ description: 'Original filename' })
  @IsString()
  fileName: string;

  @ApiProperty({ description: 'Total file size in bytes' })
  @IsNumber()
  @Max(5 * 1024 * 1024 * 1024) // 5GB max
  totalSize: number;

  @ApiPropertyOptional({ description: 'MIME type of the file' })
  @IsString()
  @IsOptional()
  mimeType?: string;

  @ApiPropertyOptional({ description: 'File hash for deduplication' })
  @IsString()
  @IsOptional()
  fileHash?: string;

  @ApiPropertyOptional({ description: 'Chunk size in bytes', default: 1048576 })
  @IsNumber()
  @Min(1024) // 1KB min
  @Max(100 * 1024 * 1024) // 100MB max
  @IsOptional()
  chunkSize?: number;

  @ApiPropertyOptional({ description: 'File category', enum: FileCategory })
  @IsEnum(FileCategory)
  @IsOptional()
  category?: FileCategory;

  @ApiPropertyOptional({ description: 'Tags for the file', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ description: 'Knowledge item ID to associate with' })
  @IsString()
  @IsOptional()
  knowledgeItemId?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  metadata?: Record<string, any>;
}