import { Module } from '@nestjs/common';
import { ParserModule } from 'parser/parser.module';
import { ParseJobRepository } from './parse-job.repository';
import { ParseJobConsumerController } from './consumer/parse-job-consumer.controller';
import { ParseJobHttpController } from './parse-job.controller';
import { ParseJobService } from './parse-job.service';

@Module({
  imports: [ParserModule],
  controllers: [ParseJobConsumerController, ParseJobHttpController],
  providers: [ParseJobRepository, ParseJobService],
  exports: [ParseJobRepository],
})
export class ParseJobModule {}
