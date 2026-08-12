import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PARSE_JOB_STATUS, type DocumentCreatedEvent } from 'common/types';
import { Prisma } from 'generated/prisma/client';
import { ParserService } from 'parser/parser.service';
import { ParseJobRepository } from '../parse-job.repository';
import { randomUUID } from 'node:crypto';
import {
  enrichRequestContext,
  runWithRequestContext,
} from 'common/logging/request-context';

/** Event patterns this service speaks. Keep in sync with `rabbitmq.config.ts`. */
export const DOCUMENT_CREATED_EVENT = 'document-created';
export const DOCUMENT_PARSED_EVENT = 'document-parsed';

/** Prisma error code for a unique-constraint violation. */
const UNIQUE_CONSTRAINT_VIOLATION = 'P2002';

@Controller()
export class ParseJobConsumerController {
  private readonly logger = new Logger(ParseJobConsumerController.name);

  constructor(
    private readonly parseJobRepository: ParseJobRepository,
    private readonly parserService: ParserService,
  ) {}

  @EventPattern(DOCUMENT_CREATED_EVENT)
  handleDocumentCreated(@Payload() event: DocumentCreatedEvent): Promise<void> {
    // The producer's correlationId becomes this consumer's trace id, so a
    // document can be followed across services in the logs.
    return runWithRequestContext(
      {
        correlationId: event?.correlationId ?? randomUUID(),
        tenantId: event?.tenantId,
      },
      () => this.consume(event),
    );
  }

  private async consume(event: DocumentCreatedEvent): Promise<void> {
    const startedAt = Date.now();

    if (!this.isValid(event)) {
      // Field names only: the payload itself is never logged.
      this.logger.error({
        message: 'Dropping malformed document-created event',
        presentFields: event ? Object.keys(event) : [],
      });
      return;
    }

    this.logger.log({
      message: 'document-created event received',
      documentId: event.id,
      type: event.type,
      size: event.size,
    });

    // Idempotency: skip events we have already consumed (acks silently).
    // `correlationId` uniquely identifies the event.
    const existing = await this.parseJobRepository.findByIdempotencyKey(
      event.correlationId,
    );
    if (existing) {
      this.logger.log({
        message: 'Event already consumed — skipping',
        jobId: existing.id,
        reason: 'duplicate',
      });
      return;
    }

    let jobId: string;
    try {
      const job = await this.parseJobRepository.create({
        documentId: event.id,
        documentPath: event.filePath,
        tenantId: event.tenantId,
        idempotencyKey: event.correlationId,
        status: PARSE_JOB_STATUS.QUEUED,
        metadata: {
          name: event.name,
          type: event.type,
          size: event.size,
          options: event.options,
          attempt: event.attempt,
        },
      });
      jobId = job.id;
      enrichRequestContext({ jobId });
      this.logger.log({ message: 'Parse job created', jobId });
    } catch (error) {
      // A concurrent redelivery may have won the race between the lookup above
      // and this insert; the unique `idempotencyKey` turns that into a P2002.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === UNIQUE_CONSTRAINT_VIOLATION
      ) {
        this.logger.log({
          message: 'Event already consumed — skipping',
          reason: 'idempotency-race',
        });
        return;
      }
      this.logger.error(
        { message: 'Could not create parse job', documentId: event.id },
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }

    try {
      await this.parseJobRepository.updateStatus(
        jobId,
        PARSE_JOB_STATUS.PROCESSING,
      );
      await this.parseJobRepository.incrementAttemptCount(jobId);

      const result = await this.parserService.parse({
        jobId,
        documentId: event.id,
        documentPath: event.filePath,
        tenantId: event.tenantId,
        type: event.type,
        options: event.options,
      });

      await this.parseJobRepository.updateStatus(
        jobId,
        PARSE_JOB_STATUS.SUCCESS,
        { parseDataPath: result.parseDataPath },
      );

      this.logger.log({
        message: 'document-created event handled',
        jobId,
        fileType: result.fileType,
        durationMs: Date.now() - startedAt,
      });

      // TO DO: emit a `document-parsed` event so other services
      // (document/rag) can pick up the parsed output. Wiring the
      // RABBITMQ_CLIENT emit is deferred to a later change.
      // this.rmqClient.emit(DOCUMENT_PARSED_EVENT, {
      //   documentId: event.id,
      //   tenantId: event.tenantId,
      //   correlationId: event.correlationId,
      //   parseDataPath: result.parseDataPath,
      // });
    } catch (error) {
      const errorReason =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        {
          message: 'Parsing failed — message acked without retry',
          jobId,
          errorReason,
          durationMs: Date.now() - startedAt,
        },
        error instanceof Error ? error.stack : undefined,
      );
      await this.parseJobRepository.updateStatus(
        jobId,
        PARSE_JOB_STATUS.FAILED,
        { errorReason },
      );
      // Do not rethrow: the message is acked. Bounded retry via attemptCount
      // is future work.
    }
  }

  private isValid(event: DocumentCreatedEvent): boolean {
    if (!event) return false;
    return Boolean(
      event.id &&
      event.correlationId &&
      event.filePath &&
      event.tenantId &&
      event.type,
    );
  }
}
