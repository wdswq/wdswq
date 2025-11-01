import { Module } from '@nestjs/common';
import { DatabaseTestService } from './database-test.service';
import { DatabaseTestController } from './database-test.controller';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [DatabaseTestController],
  providers: [DatabaseTestService],
  exports: [DatabaseTestService],
})
export class DatabaseTestModule {}
