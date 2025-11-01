import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../modules/prisma/prisma.service';
import { BaseRepository } from '../base.repository';
import { KnowledgeItem, Prisma } from '@prisma/client';

@Injectable()
export class KnowledgeItemRepository extends BaseRepository<
  KnowledgeItem,
  Prisma.KnowledgeItemCreateInput,
  Prisma.KnowledgeItemUpdateInput
> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(data: Prisma.KnowledgeItemCreateInput): Promise<KnowledgeItem> {
    return this.prisma.knowledgeItem.create({
      data,
      include: {
        user: true,
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
        fileAssets: true,
        bookmarks: true,
        embeddings: true,
      },
    });
  }

  async findById(id: string): Promise<KnowledgeItem | null> {
    return this.prisma.knowledgeItem.findUnique({
      where: { id },
      include: {
        user: true,
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
        fileAssets: true,
        bookmarks: true,
        embeddings: true,
      },
    });
  }

  async findMany(
    args?: Prisma.KnowledgeItemFindManyArgs
  ): Promise<KnowledgeItem[]> {
    return this.prisma.knowledgeItem.findMany({
      ...args,
      include: {
        user: true,
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
        fileAssets: true,
        bookmarks: true,
        embeddings: true,
      },
    });
  }

  async findByUserId(userId: string): Promise<KnowledgeItem[]> {
    return this.findMany({ where: { userId } });
  }

  async findByCategoryId(categoryId: string): Promise<KnowledgeItem[]> {
    return this.findMany({ where: { categoryId } });
  }

  async findByTag(tagName: string): Promise<KnowledgeItem[]> {
    return this.findMany({
      where: {
        tags: {
          some: {
            tag: {
              name: tagName,
            },
          },
        },
      },
    });
  }

  async update(
    id: string,
    data: Prisma.KnowledgeItemUpdateInput
  ): Promise<KnowledgeItem> {
    return this.prisma.knowledgeItem.update({
      where: { id },
      data,
      include: {
        user: true,
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
        fileAssets: true,
        bookmarks: true,
        embeddings: true,
      },
    });
  }

  async delete(id: string): Promise<KnowledgeItem> {
    return this.prisma.knowledgeItem.delete({ where: { id } });
  }

  async count(args?: Prisma.KnowledgeItemCountArgs): Promise<number> {
    return this.prisma.knowledgeItem.count(args);
  }

  async addTag(knowledgeItemId: string, tagId: string): Promise<void> {
    await this.prisma.knowledgeItemTag.create({
      data: {
        knowledgeItemId,
        tagId,
      },
    });
  }

  async removeTag(knowledgeItemId: string, tagId: string): Promise<void> {
    await this.prisma.knowledgeItemTag.delete({
      where: {
        knowledgeItemId_tagId: {
          knowledgeItemId,
          tagId,
        },
      },
    });
  }
}
