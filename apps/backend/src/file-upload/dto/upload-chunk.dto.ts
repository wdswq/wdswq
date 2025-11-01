import { IsString, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UploadChunkDto {
  @ApiProperty({ description: 'Upload job ID' })
  @IsUUID()
  uploadJobId: string;

  @ApiProperty({ description: 'Chunk number (0-based)' })
  @IsNumber()
  chunkNumber: number;

  @ApiPropertyOptional({ description: 'Chunk hash for verification' })
  @IsString()
  @IsOptional()
  chunkHash?: string;

  @ApiPropertyOptional({ description: 'Whether this is the last chunk' })
  @IsOptional()
  isLastChunk?: boolean;
}