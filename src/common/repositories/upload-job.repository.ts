import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../modules/prisma/prisma.service';
import { BaseRepository } from '../base.repository';
import { UploadJob, Prisma } from '@prisma/client';

@Injectable()
export class UploadJobRepository extends BaseRepository<
  UploadJob,
  Prisma.UploadJobCreateInput,
  Prisma.UploadJobUpdateInput
> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(data: Prisma.UploadJobCreateInput): Promise<UploadJob> {
    return this.prisma.uploadJob.create({
      data,
      include: {
        user: true,
      },
    });
  }

  async findById(id: string): Promise<UploadJob | null> {
    return this.prisma.uploadJob.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });
  }

  async findMany(args?: Prisma.UploadJobFindManyArgs): Promise<UploadJob[]> {
    return this.prisma.uploadJob.findMany({
      ...args,
      include: {
        user: true,
      },
    });
  }

  async findByUserId(userId: string): Promise<UploadJob[]> {
    return this.findMany({ where: { userId } });
  }

  async findByStatus(status: string): Promise<UploadJob[]> {
    return this.findMany({ where: { status } });
  }

  async findPendingJobs(): Promise<UploadJob[]> {
    return this.findByStatus('pending');
  }

  async findProcessingJobs(): Promise<UploadJob[]> {
    return this.findByStatus('processing');
  }

  async update(
    id: string,
    data: Prisma.UploadJobUpdateInput
  ): Promise<UploadJob> {
    return this.prisma.uploadJob.update({
      where: { id },
      data,
      include: {
        user: true,
      },
    });
  }

  async updateStatus(
    id: string,
    status: string,
    errorMessage?: string
  ): Promise<UploadJob> {
    const updateData: Prisma.UploadJobUpdateInput = {
      status,
      ...(status === 'completed' && { completedAt: new Date() }),
      ...(status === 'processing' &&
        !errorMessage && { startedAt: new Date() }),
      ...(errorMessage && { errorMessage }),
    };

    return this.update(id, updateData);
  }

  async updateProgress(id: string, progress: number): Promise<UploadJob> {
    return this.update(id, { progress });
  }

  async delete(id: string): Promise<UploadJob> {
    return this.prisma.uploadJob.delete({ where: { id } });
  }

  async count(args?: Prisma.UploadJobCountArgs): Promise<number> {
    return this.prisma.uploadJob.count(args);
  }

  async countByStatus(status: string): Promise<number> {
    return this.count({ where: { status } });
  }
}
