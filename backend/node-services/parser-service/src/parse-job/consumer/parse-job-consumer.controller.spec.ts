import { Test, TestingModule } from '@nestjs/testing';
import { PARSE_JOB_STATUS, type DocumentCreatedEvent } from 'common/types';
import { Prisma } from 'generated/prisma/client';
import { ParserService } from 'parser/parser.service';
import { ParseJobRepository } from '../parse-job.repository';
import { ParseJobConsumerController } from './parse-job-consumer.controller';

describe('ParseJobConsumerController', () => {
  const repository = {
    findByIdempotencyKey: jest.fn(),
    create: jest.fn(),
    updateStatus: jest.fn(),
    incrementAttemptCount: jest.fn(),
  };

  const parserService = {
    parse: jest.fn(),
  };

  const event: DocumentCreatedEvent = {
    id: 'doc-1',
    name: 'doc-1.pdf',
    filePath: '/bucket/doc-1.pdf',
    tenantId: 'tenant-1',
    type: 'pdf',
    size: 1024,
    options: { ocr: false, forceReparse: false },
    correlationId: 'corr-1',
    attempt: 0,
  };

  let controller: ParseJobConsumerController;

  beforeEach(async () => {
    jest.clearAllMocks();
    // Default happy-path behaviour; individual tests override as needed.
    repository.findByIdempotencyKey.mockResolvedValue(null);
    repository.create.mockResolvedValue({ id: 'job-1' });
    repository.updateStatus.mockResolvedValue({ id: 'job-1' });
    repository.incrementAttemptCount.mockResolvedValue({ id: 'job-1' });
    parserService.parse.mockResolvedValue({
      fileType: 'pdf',
      parseDataPath: '/bucket/doc-1.json',
      data: { kind: 'pdf' },
    });

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParseJobConsumerController],
      providers: [
        { provide: ParseJobRepository, useValue: repository },
        { provide: ParserService, useValue: parserService },
      ],
    }).compile();

    controller = module.get(ParseJobConsumerController);
  });

  it('parses a new event and records success', async () => {
    await controller.handleDocumentCreated(event);

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        documentId: 'doc-1',
        documentPath: '/bucket/doc-1.pdf',
        tenantId: 'tenant-1',
        idempotencyKey: 'corr-1',
        status: PARSE_JOB_STATUS.QUEUED,
      }),
    );
    expect(parserService.parse).toHaveBeenCalledWith({
      jobId: 'job-1',
      documentId: 'doc-1',
      documentPath: '/bucket/doc-1.pdf',
      tenantId: 'tenant-1',
      type: 'pdf',
      options: { ocr: false, forceReparse: false },
    });

    const statuses = (repository.updateStatus.mock.calls as string[][]).map(
      (call) => call[1],
    );
    expect(statuses).toEqual([
      PARSE_JOB_STATUS.PROCESSING,
      PARSE_JOB_STATUS.SUCCESS,
    ]);
    expect(repository.updateStatus).toHaveBeenLastCalledWith(
      'job-1',
      PARSE_JOB_STATUS.SUCCESS,
      { parseDataPath: '/bucket/doc-1.json' },
    );
  });

  it('skips an event that was already consumed', async () => {
    repository.findByIdempotencyKey.mockResolvedValue({ id: 'job-existing' });

    await controller.handleDocumentCreated(event);

    expect(repository.create).not.toHaveBeenCalled();
    expect(parserService.parse).not.toHaveBeenCalled();
    expect(repository.updateStatus).not.toHaveBeenCalled();
  });

  it('drops a malformed event without touching the database', async () => {
    const invalid = { ...event, filePath: '' };

    await controller.handleDocumentCreated(invalid);

    expect(repository.findByIdempotencyKey).not.toHaveBeenCalled();
    expect(repository.create).not.toHaveBeenCalled();
    expect(parserService.parse).not.toHaveBeenCalled();
  });

  it('marks the job failed when parsing throws and does not rethrow', async () => {
    parserService.parse.mockRejectedValue(new Error('boom'));

    await expect(
      controller.handleDocumentCreated(event),
    ).resolves.toBeUndefined();

    expect(repository.updateStatus).toHaveBeenLastCalledWith(
      'job-1',
      PARSE_JOB_STATUS.FAILED,
      { errorReason: 'boom' },
    );
  });

  it('treats a P2002 create conflict as an already-consumed duplicate', async () => {
    repository.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('duplicate', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );

    await expect(
      controller.handleDocumentCreated(event),
    ).resolves.toBeUndefined();

    expect(parserService.parse).not.toHaveBeenCalled();
    expect(repository.updateStatus).not.toHaveBeenCalled();
  });

  it('rethrows a non-P2002 create error', async () => {
    repository.create.mockRejectedValue(new Error('db down'));

    await expect(controller.handleDocumentCreated(event)).rejects.toThrow(
      'db down',
    );
    expect(parserService.parse).not.toHaveBeenCalled();
  });
});
