import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../modules/prisma/prisma.service';
import { BaseRepository } from '../base.repository';
import { EmbeddingRecord, Prisma } from '@prisma/client';

@Injectable()
export class EmbeddingRecordRepository extends BaseRepository<
  EmbeddingRecord,
  Prisma.EmbeddingRecordCreateInput,
  Prisma.EmbeddingRecordUpdateInput
> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(
    data: Prisma.EmbeddingRecordCreateInput
  ): Promise<EmbeddingRecord> {
    return this.prisma.embeddingRecord.create({
      data,
      include: {
        user: true,
        knowledgeItem: true,
      },
    });
  }

  async findById(id: string): Promise<EmbeddingRecord | null> {
    return this.prisma.embeddingRecord.findUnique({
      where: { id },
      include: {
        user: true,
        knowledgeItem: true,
      },
    });
  }

  async findMany(
    args?: Prisma.EmbeddingRecordFindManyArgs
  ): Promise<EmbeddingRecord[]> {
    return this.prisma.embeddingRecord.findMany({
      ...args,
      include: {
        user: true,
        knowledgeItem: true,
      },
    });
  }

  async findByUserId(userId: string): Promise<EmbeddingRecord[]> {
    return this.findMany({ where: { userId } });
  }

  async findByKnowledgeItemId(
    knowledgeItemId: string
  ): Promise<EmbeddingRecord[]> {
    return this.findMany({ where: { knowledgeItemId } });
  }

  async findByModel(model: string): Promise<EmbeddingRecord[]> {
    return this.findMany({ where: { model } });
  }

  async update(
    id: string,
    data: Prisma.EmbeddingRecordUpdateInput
  ): Promise<EmbeddingRecord> {
    return this.prisma.embeddingRecord.update({
      where: { id },
      data,
      include: {
        user: true,
        knowledgeItem: true,
      },
    });
  }

  async delete(id: string): Promise<EmbeddingRecord> {
    return this.prisma.embeddingRecord.delete({ where: { id } });
  }

  async count(args?: Prisma.EmbeddingRecordCountArgs): Promise<number> {
    return this.prisma.embeddingRecord.count(args);
  }

  async deleteByKnowledgeItemId(knowledgeItemId: string): Promise<void> {
    await this.prisma.embeddingRecord.deleteMany({
      where: { knowledgeItemId },
    });
  }
}
