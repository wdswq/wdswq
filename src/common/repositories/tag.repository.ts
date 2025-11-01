import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../modules/prisma/prisma.service';
import { BaseRepository } from '../base.repository';
import { Tag, Prisma } from '@prisma/client';

@Injectable()
export class TagRepository extends BaseRepository<
  Tag,
  Prisma.TagCreateInput,
  Prisma.TagUpdateInput
> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(data: Prisma.TagCreateInput): Promise<Tag> {
    return this.prisma.tag.create({
      data,
      include: {
        _count: {
          select: {
            knowledgeItems: true,
          },
        },
      },
    });
  }

  async findById(id: string): Promise<Tag | null> {
    return this.prisma.tag.findUnique({
      where: { id },
      include: {
        knowledgeItems: {
          include: {
            knowledgeItem: true,
          },
        },
        _count: {
          select: {
            knowledgeItems: true,
          },
        },
      },
    });
  }

  async findMany(args?: Prisma.TagFindManyArgs): Promise<Tag[]> {
    return this.prisma.tag.findMany({
      ...args,
      include: {
        _count: {
          select: {
            knowledgeItems: true,
          },
        },
      },
    });
  }

  async findByName(name: string): Promise<Tag | null> {
    return this.prisma.tag.findUnique({
      where: { name },
      include: {
        _count: {
          select: {
            knowledgeItems: true,
          },
        },
      },
    });
  }

  async findPopular(limit: number = 10): Promise<Tag[]> {
    return this.findMany({
      orderBy: {
        knowledgeItems: {
          _count: 'desc',
        },
      },
      take: limit,
    });
  }

  async update(id: string, data: Prisma.TagUpdateInput): Promise<Tag> {
    return this.prisma.tag.update({
      where: { id },
      data,
      include: {
        _count: {
          select: {
            knowledgeItems: true,
          },
        },
      },
    });
  }

  async delete(id: string): Promise<Tag> {
    return this.prisma.tag.delete({ where: { id } });
  }

  async count(args?: Prisma.TagCountArgs): Promise<number> {
    return this.prisma.tag.count(args);
  }
}
