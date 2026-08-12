import { Module } from '@nestjs/common';
import { LlmFactoryController } from './llm-factory.controller';
import { LlmFactoryService } from './llm-factory.service';
import { PrismaModule } from 'src/infrastructure/database/prisma.module';
import { LlmFactoryRepository } from './llm-factory.repository';
import { LlmFactoryValidator } from './validators/llm-factory.validators';

@Module({
  imports: [PrismaModule],
  controllers: [LlmFactoryController],
  providers: [LlmFactoryService, LlmFactoryRepository, LlmFactoryValidator],
})
export class LlmFactoryModule {}
