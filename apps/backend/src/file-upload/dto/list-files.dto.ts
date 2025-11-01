import { IsString, IsNumber, IsOptional, IsEnum, IsArray, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { FileAssetStatus } from '../entities/file-asset.entity';
import { FileCategory } from './initiate-upload.dto';

export class ListFilesDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Search by filename' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by MIME type' })
  @IsString()
  @IsOptional()
  mimeType?: string;

  @ApiPropertyOptional({ description: 'Filter by category', enum: FileCategory })
  @IsEnum(FileCategory)
  @IsOptional()
  category?: FileCategory;

  @ApiPropertyOptional({ description: 'Filter by status', enum: FileAssetStatus })
  @IsEnum(FileAssetStatus)
  @IsOptional()
  status?: FileAssetStatus;

  @ApiPropertyOptional({ description: 'Filter by tags', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ description: 'Filter by knowledge item ID' })
  @IsString()
  @IsOptional()
  knowledgeItemId?: string;

  @ApiPropertyOptional({ description: 'Minimum file size' })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  minSize?: number;

  @ApiPropertyOptional({ description: 'Maximum file size' })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  maxSize?: number;

  @ApiPropertyOptional({ description: 'Sort field', default: 'createdAt' })
  @IsString()
  @IsOptional()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ description: 'Sort order', default: 'DESC' })
  @IsString()
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}