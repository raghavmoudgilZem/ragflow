import { Module } from '@nestjs/common';
import { LlmController } from './llm.controller';
import { LlmService } from './llm.service';
import { LlmRepository } from './llm.repository';
import { PrismaModule } from 'src/infrastructure/database/prisma.module';
import { LlmValidator } from './validators/llm.validator';

@Module({
  imports: [PrismaModule],
  controllers: [LlmController],
  providers: [LlmService, LlmRepository, LlmValidator],
})
export class LlmModule {}
