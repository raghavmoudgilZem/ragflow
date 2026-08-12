import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'prisma/prisma.service';
import { PARSE_JOB_STATUS } from 'common/types';
import { ParseJobRepository } from './parse-job.repository';

describe('ParseJobRepository', () => {
  const parseJob = {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  };

  type UpdateArgs = { where: { id: string }; data: Record<string, unknown> };

  /** `jest.fn()` widens recorded arguments to `any`, so narrow them once here. */
  const firstUpdateArgs = (): UpdateArgs =>
    (parseJob.update.mock.calls as UpdateArgs[][])[0][0];

  let repository: ParseJobRepository;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParseJobRepository,
        { provide: PrismaService, useValue: { parseJob } },
      ],
    }).compile();

    repository = module.get(ParseJobRepository);
  });

  describe('create', () => {
    it('should default the status to queued', async () => {
      await repository.create({
        documentId: 'doc-1',
        documentPath: '/bucket/doc-1.pdf',
        tenantId: 'tenant-1',
      });

      expect(parseJob.create).toHaveBeenCalledWith({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- expect.objectContaining() is typed `any` by @jest/expect
        data: expect.objectContaining({
          documentId: 'doc-1',
          documentPath: '/bucket/doc-1.pdf',
          tenantId: 'tenant-1',
          status: PARSE_JOB_STATUS.QUEUED,
        }),
      });
    });

    it('should keep an explicitly provided status', async () => {
      await repository.create({
        documentId: 'doc-1',
        documentPath: '/bucket/doc-1.pdf',
        tenantId: 'tenant-1',
        status: PARSE_JOB_STATUS.PROCESSING,
        idempotencyKey: 'key-1',
        metadata: { pages: 12 },
      });

      expect(parseJob.create).toHaveBeenCalledWith({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- expect.objectContaining() is typed `any` by @jest/expect
        data: expect.objectContaining({
          status: PARSE_JOB_STATUS.PROCESSING,
          idempotencyKey: 'key-1',
          metadata: { pages: 12 },
        }),
      });
    });
  });

  describe('lookups', () => {
    it('should find a job by id', async () => {
      await repository.findById('job-1');

      expect(parseJob.findUnique).toHaveBeenCalledWith({
        where: { id: 'job-1' },
      });
    });

    it('should find every job for a document, newest first', async () => {
      await repository.findByDocumentId('doc-1');

      expect(parseJob.findMany).toHaveBeenCalledWith({
        where: { documentId: 'doc-1' },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should find a job by idempotency key', async () => {
      await repository.findByIdempotencyKey('key-1');

      expect(parseJob.findUnique).toHaveBeenCalledWith({
        where: { idempotencyKey: 'key-1' },
      });
    });
  });

  describe('updateStatus', () => {
    it('should stamp startedAt when moving to processing', async () => {
      await repository.updateStatus('job-1', PARSE_JOB_STATUS.PROCESSING);

      const { data } = firstUpdateArgs();
      expect(data.status).toBe(PARSE_JOB_STATUS.PROCESSING);
      expect(data.startedAt).toBeInstanceOf(Date);
      expect(data.completedAt).toBeUndefined();
    });

    it('should stamp completedAt on success', async () => {
      await repository.updateStatus('job-1', PARSE_JOB_STATUS.SUCCESS, {
        parseDataPath: '/bucket/doc-1.json',
      });

      const { data } = firstUpdateArgs();
      expect(data.completedAt).toBeInstanceOf(Date);
      expect(data.startedAt).toBeUndefined();
      expect(data.parseDataPath).toBe('/bucket/doc-1.json');
    });

    it('should record the error reason on failure', async () => {
      await repository.updateStatus('job-1', PARSE_JOB_STATUS.FAILED, {
        errorReason: 'unsupported mime type',
      });

      const { where, data } = firstUpdateArgs();
      expect(where).toEqual({ id: 'job-1' });
      expect(data.errorReason).toBe('unsupported mime type');
      expect(data.completedAt).toBeInstanceOf(Date);
    });
  });

  it('should increment the attempt count atomically', async () => {
    await repository.incrementAttemptCount('job-1');

    expect(parseJob.update).toHaveBeenCalledWith({
      where: { id: 'job-1' },
      data: { attemptCount: { increment: 1 } },
    });
  });
});
