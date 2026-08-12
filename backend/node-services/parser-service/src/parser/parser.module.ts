import { Module } from '@nestjs/common';
import { ParserService } from './parser.service';
import { ParseJobRepository } from 'parse-job/parse-job.repository';

@Module({
  providers: [ParserService, ParseJobRepository],
  exports: [ParserService],
})
export class ParserModule {}
