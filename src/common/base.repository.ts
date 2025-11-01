import { PrismaService } from '../modules/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class BaseRepository<TModel, TCreateInput, TUpdateInput> {
  constructor(protected readonly prisma: PrismaService) {}

  abstract create(data: TCreateInput): Promise<TModel>;
  abstract findById(id: string): Promise<TModel | null>;
  abstract findMany(args?: any): Promise<TModel[]>;
  abstract update(id: string, data: TUpdateInput): Promise<TModel>;
  abstract delete(id: string): Promise<TModel>;
  abstract count(args?: any): Promise<number>;
}
