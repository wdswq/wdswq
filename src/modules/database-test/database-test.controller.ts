import { Controller, Get, Post } from '@nestjs/common';
import { DatabaseTestService } from './database-test.service';

@Controller('api/test')
export class DatabaseTestController {
  constructor(private readonly databaseTestService: DatabaseTestService) {}

  @Get('connection')
  async testConnection() {
    return this.databaseTestService.testConnection();
  }

  @Get('stats')
  async getStats() {
    return this.databaseTestService.getDatabaseStats();
  }

  @Post('sample-data')
  async createSampleData() {
    return this.databaseTestService.createSampleData();
  }
}
