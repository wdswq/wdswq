import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRepository } from '../../common/repositories/user.repository';
import { CategoryRepository } from '../../common/repositories/category.repository';
import { TagRepository } from '../../common/repositories/tag.repository';
import { KnowledgeItemRepository } from '../../common/repositories/knowledge-item.repository';

@Injectable()
export class DatabaseTestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userRepo: UserRepository,
    private readonly categoryRepo: CategoryRepository,
    private readonly tagRepo: TagRepository,
    private readonly knowledgeItemRepo: KnowledgeItemRepository
  ) {}

  async testConnection(): Promise<{ message: string; timestamp: string }> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        message: 'Database connection successful',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Database connection failed: ${error.message}`);
    }
  }

  async createSampleData(): Promise<any> {
    try {
      // Create a sample user
      const user = await this.userRepo.create({
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        password: 'hashedpassword',
      });

      // Create a sample category
      const category = await this.categoryRepo.create({
        name: 'Technology',
        description: 'Technology related knowledge items',
        color: '#3B82F6',
      });

      // Create sample tags
      const tag1 = await this.tagRepo.create({
        name: 'programming',
        color: '#10B981',
      });

      const tag2 = await this.tagRepo.create({
        name: 'javascript',
        color: '#F59E0B',
      });

      // Create a sample knowledge item
      const knowledgeItem = await this.knowledgeItemRepo.create({
        title: 'Introduction to JavaScript',
        content:
          'JavaScript is a programming language that enables interactive web pages.',
        summary: 'A brief introduction to JavaScript programming language.',
        user: {
          connect: { id: user.id },
        },
        category: {
          connect: { id: category.id },
        },
        tags: {
          create: [
            { tag: { connect: { id: tag1.id } } },
            { tag: { connect: { id: tag2.id } } },
          ],
        },
      });

      return {
        user,
        category,
        tags: [tag1, tag2],
        knowledgeItem,
      };
    } catch (error) {
      throw new Error(`Sample data creation failed: ${error.message}`);
    }
  }

  async getDatabaseStats(): Promise<any> {
    try {
      const [userCount, categoryCount, tagCount, knowledgeItemCount] =
        await Promise.all([
          this.userRepo.count(),
          this.categoryRepo.count(),
          this.tagRepo.count(),
          this.knowledgeItemRepo.count(),
        ]);

      return {
        users: userCount,
        categories: categoryCount,
        tags: tagCount,
        knowledgeItems: knowledgeItemCount,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Database stats retrieval failed: ${error.message}`);
    }
  }
}
