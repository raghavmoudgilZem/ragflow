import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ParseJobRepository } from './parse-job.repository';
import { CreateParserJobDto } from './dto/create-parse.dto';
import { ParserService } from 'parser/parser.service';
import { enrichRequestContext } from 'common/logging/request-context';

@Injectable()
export class ParseJobService {
  private readonly logger = new Logger(ParseJobService.name);
  constructor(
    private readonly repository: ParseJobRepository,
    private readonly parserService: ParserService,
  ) {}

  async handleNewDocument(payload: CreateParserJobDto) {
    const data = await this.repository.create({
      ...payload,
      status: 'queued',
    });

    // Every later line in this request now carries the job and tenant ids.
    enrichRequestContext({ jobId: data.id, tenantId: payload.tenantId });
    this.logger.log({
      message: 'Parse job queued',
      jobId: data.id,
      documentId: payload.documentId,
      type: payload.type,
    });

    // Parsing runs detached from the HTTP response, so the failure path has to
    // be attached to the promise: a try/catch around the call never sees an
    // async rejection, and it would surface as an unhandled rejection instead.
    void this.parserService
      .parse({ ...data, jobId: data.id, type: payload.type })
      .catch((error: unknown) => {
        this.logger.error(
          { message: 'Background parsing failed', jobId: data.id },
          error instanceof Error ? error.stack : String(error),
        );
      });

    return data;
  }

  async getJobByJobId(jobId: string) {
    const res = await this.repository.findById(jobId);
    if (!res) {
      this.logger.warn({ message: 'Parse job not found', jobId });
      throw new NotFoundException('parse job not found');
    }

    this.logger.debug({
      message: 'Parse job status served',
      jobId,
      status: res.status,
    });

    return {
      id: res.id,
      status: res.status,
      parsedDataPath: res.parseDataPath || null,
    };
  }
}
