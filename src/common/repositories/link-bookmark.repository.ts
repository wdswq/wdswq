import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../modules/prisma/prisma.service';
import { BaseRepository } from '../base.repository';
import { LinkBookmark, Prisma } from '@prisma/client';

@Injectable()
export class LinkBookmarkRepository extends BaseRepository<
  LinkBookmark,
  Prisma.LinkBookmarkCreateInput,
  Prisma.LinkBookmarkUpdateInput
> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(data: Prisma.LinkBookmarkCreateInput): Promise<LinkBookmark> {
    return this.prisma.linkBookmark.create({
      data,
      include: {
        user: true,
        knowledgeItem: true,
      },
    });
  }

  async findById(id: string): Promise<LinkBookmark | null> {
    return this.prisma.linkBookmark.findUnique({
      where: { id },
      include: {
        user: true,
        knowledgeItem: true,
      },
    });
  }

  async findMany(
    args?: Prisma.LinkBookmarkFindManyArgs
  ): Promise<LinkBookmark[]> {
    return this.prisma.linkBookmark.findMany({
      ...args,
      include: {
        user: true,
        knowledgeItem: true,
      },
    });
  }

  async findByUserId(userId: string): Promise<LinkBookmark[]> {
    return this.findMany({ where: { userId } });
  }

  async findByKnowledgeItemId(
    knowledgeItemId: string
  ): Promise<LinkBookmark[]> {
    return this.findMany({ where: { knowledgeItemId } });
  }

  async findByUrl(url: string): Promise<LinkBookmark | null> {
    return this.prisma.linkBookmark.findFirst({ where: { url } });
  }

  async update(
    id: string,
    data: Prisma.LinkBookmarkUpdateInput
  ): Promise<LinkBookmark> {
    return this.prisma.linkBookmark.update({
      where: { id },
      data,
      include: {
        user: true,
        knowledgeItem: true,
      },
    });
  }

  async delete(id: string): Promise<LinkBookmark> {
    return this.prisma.linkBookmark.delete({ where: { id } });
  }

  async count(args?: Prisma.LinkBookmarkCountArgs): Promise<number> {
    return this.prisma.linkBookmark.count(args);
  }
}
