import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import {
  PARSE_JOB_STATUS,
  type CreateParseJobInput,
  type ParseJobStatus,
  type UpdateParseJobStatusInput,
} from 'common/types';
import type { ParseJob, Prisma } from 'generated/prisma/client';

@Injectable()
export class ParseJobRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(input: CreateParseJobInput): Promise<ParseJob> {
    return this.prisma.parseJob.create({
      data: {
        documentId: input.documentId,
        documentPath: input.documentPath,
        tenantId: input.tenantId,
        status: input.status ?? PARSE_JOB_STATUS.QUEUED,
        maxAttempts: input.maxAttempts,
        idempotencyKey: input.idempotencyKey,
        metadata: input.metadata as Prisma.InputJsonObject | undefined,
      },
    });
  }

  findById(id: string): Promise<ParseJob | null> {
    return this.prisma.parseJob.findUnique({ where: { id } });
  }

  findByDocumentId(documentId: string): Promise<ParseJob[]> {
    return this.prisma.parseJob.findMany({
      where: { documentId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findByIdempotencyKey(idempotencyKey: string): Promise<ParseJob | null> {
    return this.prisma.parseJob.findUnique({ where: { idempotencyKey } });
  }

  /**
   * Stamps `startedAt` / `completedAt` alongside the status so callers never
   * have to keep the timestamps in sync themselves.
   */
  updateStatus(
    id: string,
    status: ParseJobStatus,
    input: UpdateParseJobStatusInput = {},
  ): Promise<ParseJob> {
    const now = new Date();

    return this.prisma.parseJob.update({
      where: { id },
      data: {
        status,
        errorReason: input.errorReason,
        parseDataPath: input.parseDataPath,
        startedAt: status === PARSE_JOB_STATUS.PROCESSING ? now : undefined,
        completedAt:
          status === PARSE_JOB_STATUS.SUCCESS ||
          status === PARSE_JOB_STATUS.FAILED
            ? now
            : undefined,
      },
    });
  }

  incrementAttemptCount(id: string): Promise<ParseJob> {
    return this.prisma.parseJob.update({
      where: { id },
      data: { attemptCount: { increment: 1 } },
    });
  }
}
