import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../modules/prisma/prisma.service';
import { BaseRepository } from '../base.repository';
import { FileAsset, Prisma } from '@prisma/client';

@Injectable()
export class FileAssetRepository extends BaseRepository<
  FileAsset,
  Prisma.FileAssetCreateInput,
  Prisma.FileAssetUpdateInput
> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(data: Prisma.FileAssetCreateInput): Promise<FileAsset> {
    return this.prisma.fileAsset.create({
      data,
      include: {
        user: true,
        knowledgeItem: true,
      },
    });
  }

  async findById(id: string): Promise<FileAsset | null> {
    return this.prisma.fileAsset.findUnique({
      where: { id },
      include: {
        user: true,
        knowledgeItem: true,
      },
    });
  }

  async findMany(args?: Prisma.FileAssetFindManyArgs): Promise<FileAsset[]> {
    return this.prisma.fileAsset.findMany({
      ...args,
      include: {
        user: true,
        knowledgeItem: true,
      },
    });
  }

  async findByUserId(userId: string): Promise<FileAsset[]> {
    return this.findMany({ where: { userId } });
  }

  async findByKnowledgeItemId(knowledgeItemId: string): Promise<FileAsset[]> {
    return this.findMany({ where: { knowledgeItemId } });
  }

  async findByPath(path: string): Promise<FileAsset | null> {
    return this.prisma.fileAsset.findFirst({ where: { path } });
  }

  async update(
    id: string,
    data: Prisma.FileAssetUpdateInput
  ): Promise<FileAsset> {
    return this.prisma.fileAsset.update({
      where: { id },
      data,
      include: {
        user: true,
        knowledgeItem: true,
      },
    });
  }

  async delete(id: string): Promise<FileAsset> {
    return this.prisma.fileAsset.delete({ where: { id } });
  }

  async count(args?: Prisma.FileAssetCountArgs): Promise<number> {
    return this.prisma.fileAsset.count(args);
  }
}
