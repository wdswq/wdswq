import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResumeUploadDto {
  @ApiProperty({ description: 'Upload job ID to resume' })
  @IsUUID()
  uploadJobId: string;

  @ApiProperty({ description: 'File hash for verification' })
  @IsString()
  fileHash: string;
}