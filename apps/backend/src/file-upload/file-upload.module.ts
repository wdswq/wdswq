import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { FileUploadController } from './controllers/file-upload.controller';
import { FileUploadService } from './services/file-upload.service';
import { MinioService } from './services/minio.service';
import { FileValidationService } from './services/file-validation.service';
import { FileAsset } from './entities/file-asset.entity';
import { UploadJob } from './entities/upload-job.entity';
import { KnowledgeItem } from './entities/knowledge-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileAsset, UploadJob, KnowledgeItem]),
    ConfigModule,
  ],
  controllers: [FileUploadController],
  providers: [
    FileUploadService,
    MinioService,
    FileValidationService,
  ],
  exports: [
    FileUploadService,
    MinioService,
    FileValidationService,
  ],
})
export class FileUploadModule {}