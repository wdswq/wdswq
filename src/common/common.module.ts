import { Module } from '@nestjs/common';
import { PrismaModule } from '../modules/prisma/prisma.module';
import {
  UserRepository,
  KnowledgeItemRepository,
  CategoryRepository,
  TagRepository,
  FileAssetRepository,
  LinkBookmarkRepository,
  EmbeddingRecordRepository,
  UploadJobRepository,
} from './repositories';

@Module({
  imports: [PrismaModule],
  providers: [
    UserRepository,
    KnowledgeItemRepository,
    CategoryRepository,
    TagRepository,
    FileAssetRepository,
    LinkBookmarkRepository,
    EmbeddingRecordRepository,
    UploadJobRepository,
  ],
  exports: [
    UserRepository,
    KnowledgeItemRepository,
    CategoryRepository,
    TagRepository,
    FileAssetRepository,
    LinkBookmarkRepository,
    EmbeddingRecordRepository,
    UploadJobRepository,
  ],
})
export class CommonModule {}
