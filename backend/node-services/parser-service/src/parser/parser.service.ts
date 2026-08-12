import { extname } from 'node:path';
import { Injectable, Logger } from '@nestjs/common';
import type { ParseInput, ParseResult } from 'common/types';
import { ParseJobRepository } from 'parse-job/parse-job.repository';

/**
 * Turns a document referenced by a MinIO `filePath` into structured parse data.
 *
 * ⚠️ MOCK IMPLEMENTATION — this returns dummy data keyed off the file type.
 * The real implementation is the seam that will call the Python parser
 * (script or HTTP API); that call receives `filePath` and is responsible for
 * fetching the object from MinIO. The consumer never downloads the bytes.
 */
@Injectable()
export class ParserService {
  private readonly logger = new Logger(ParserService.name);

  constructor(private readonly parseJobRepository: ParseJobRepository) {}

  // Returns a Promise so the mock can be swapped for the async Python/HTTP call
  // without touching the consumer. The mock body itself has nothing to await.

  async parse(input: ParseInput): Promise<ParseResult> {
    // The event carries the file type; fall back to the extension if absent.
    const startedAt = Date.now();
    try {
      const fileType = (
        input.type || extname(input.documentPath).replace('.', '')
      ).toLowerCase();
      const parseDataPath = input.documentPath.replace(/\.[^/.]+$/, '.json');

      // Only the file type and ids — never the document contents or the
      // storage URL, which can carry presigned credentials.
      this.logger.log({
        message: 'Parsing started',
        jobId: input.jobId,
        documentId: input.documentId,
        fileType: fileType || 'unknown',
      });

      // MOCK: dummy payload per file type until the Python parser is wired in.
      let data: Record<string, unknown>;
      switch (fileType) {
        case 'pdf':
          data = {
            kind: 'pdf',
            pages: 3,
            data: [
              {
                pageNo: 1,
                text: 'Mock data in pdf',
                images: ['Contains graph with wether information.'],
              },
            ],
          };
          break;
        case 'docx':
          data = { kind: 'docx', paragraphs: 5, text: 'dummy docx content' };
          break;
        case 'txt':
          data = { kind: 'txt', text: 'dummy txt content' };
          break;
        case 'csv':
          data = { kind: 'csv', rows: 10, columns: 4 };
          break;
        default:
          data = { kind: 'unknown', text: 'dummy content' };
      }

      await this.parseJobRepository.updateStatus(input.jobId, 'success', {
        parseDataPath: `http://minio.localhost:9000/rag-flow-local/nodejs/tenants/${input.tenantId}/parsed-data/${input.jobId}.json`, // Todo: Implement Minio service + repo and use to upload the file and return url
      });

      this.logger.log({
        message: 'Parsing succeeded',
        jobId: input.jobId,
        documentId: input.documentId,
        fileType: fileType || 'unknown',
        durationMs: Date.now() - startedAt,
      });

      return {
        fileType: fileType || 'unknown',
        parseDataPath,
        data,
      };
    } catch (e) {
      this.logger.error(
        {
          message: 'Parsing failed',
          jobId: input.jobId,
          documentId: input.documentId,
          durationMs: Date.now() - startedAt,
        },
        e instanceof Error ? e.stack : String(e),
      );

      try {
        await this.parseJobRepository.updateStatus(input.jobId, 'failed', {
          parseDataPath: null,
        });
      } catch (statusError) {
        // Losing the status write would leave the job stuck in `processing`
        // with no trace of why, so it gets its own record.
        this.logger.error(
          { message: 'Could not mark job as failed', jobId: input.jobId },
          statusError instanceof Error
            ? statusError.stack
            : String(statusError),
        );
      }
      throw e;
    }
  }
}
