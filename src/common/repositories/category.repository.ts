import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../modules/prisma/prisma.service';
import { BaseRepository } from '../base.repository';
import { Category, Prisma } from '@prisma/client';

@Injectable()
export class CategoryRepository extends BaseRepository<
  Category,
  Prisma.CategoryCreateInput,
  Prisma.CategoryUpdateInput
> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(data: Prisma.CategoryCreateInput): Promise<Category> {
    return this.prisma.category.create({
      data,
      include: {
        knowledgeItems: true,
      },
    });
  }

  async findById(id: string): Promise<Category | null> {
    return this.prisma.category.findUnique({
      where: { id },
      include: {
        knowledgeItems: true,
      },
    });
  }

  async findMany(args?: Prisma.CategoryFindManyArgs): Promise<Category[]> {
    return this.prisma.category.findMany({
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

  async findByName(name: string): Promise<Category | null> {
    return this.prisma.category.findUnique({ where: { name } });
  }

  async update(
    id: string,
    data: Prisma.CategoryUpdateInput
  ): Promise<Category> {
    return this.prisma.category.update({
      where: { id },
      data,
      include: {
        knowledgeItems: true,
      },
    });
  }

  async delete(id: string): Promise<Category> {
    return this.prisma.category.delete({ where: { id } });
  }

  async count(args?: Prisma.CategoryCountArgs): Promise<number> {
    return this.prisma.category.count(args);
  }
}
