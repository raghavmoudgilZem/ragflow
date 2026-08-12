import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ParserService } from 'parser/parser.service';
import { CreateParserJobDto } from './dto/create-parse.dto';
import { ParseJobService } from './parse-job.service';

@Controller('/api/v1/parse')
export class ParseJobHttpController {
  // Request/response logging is handled once, globally, by LoggingInterceptor;
  // the domain lines live in ParseJobService where the ids are known.
  constructor(
    private readonly parseJobService: ParseJobService,
    private readonly parserService: ParserService,
  ) {}

  @Post('')
  @HttpCode(HttpStatus.CREATED)
  async handleDocumentParse(@Body() data: CreateParserJobDto) {
    const job = await this.parseJobService.handleNewDocument({
      documentId: data.documentId,
      documentPath: data.documentPath,
      tenantId: data.tenantId,
      options: data.options,
      type: data.type,
    });

    return { jobId: job.id };
  }

  @Get('/:jobId/status')
  @HttpCode(HttpStatus.OK)
  getStatus(@Param('jobId', ParseUUIDPipe) jobId: string) {
    return this.parseJobService.getJobByJobId(jobId);
  }
}
