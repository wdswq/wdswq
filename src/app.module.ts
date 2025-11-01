import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './modules/prisma/prisma.module';
import { CommonModule } from './common/common.module';
import { DatabaseTestModule } from './modules/database-test/database-test.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    CommonModule,
    DatabaseTestModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
