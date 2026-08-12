import { Module } from '@nestjs/common';
import { ExecutionService } from './execution.service';
import { ExecutionController } from './execution.controller';
import { DatasetModule } from '../../integration/dataset-client/dataset.module';
import { LlmModule } from '../../integration/llm-client/llm.module';
import { SearchModule } from '../search/search.module';

@Module({
  imports: [SearchModule, DatasetModule, LlmModule],
  controllers: [ExecutionController],
  providers: [ExecutionService],
  exports: [ExecutionService],
})
export class ExecutionModule {}
