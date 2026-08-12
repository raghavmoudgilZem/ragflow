import { NotFoundException } from '@nestjs/common';
import { ParseJobService } from './parse-job.service';
import type { ParseJobRepository } from './parse-job.repository';
import type { ParserService } from 'parser/parser.service';
import { CreateParserJobDto, DocumentType } from './dto/create-parse.dto';

describe('ParseJobService', () => {
  const repository = {
    create: jest.fn(),
    findById: jest.fn(),
  };
  const parserService = {
    parse: jest.fn(),
  };

  const service = new ParseJobService(
    repository as unknown as ParseJobRepository,
    parserService as unknown as ParserService,
  );

  const payload: CreateParserJobDto = {
    documentId: 'doc-1',
    documentPath: '/bucket/doc-1.pdf',
    tenantId: 'tenant-1',
    type: DocumentType.PDF,
    options: { ocr: false },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    repository.create.mockResolvedValue({ id: 'job-1', ...payload });
    parserService.parse.mockResolvedValue(undefined);
  });

  describe('handleNewDocument', () => {
    it('creates a queued job and kicks off parsing asynchronously', async () => {
      const job = await service.handleNewDocument(payload);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ ...payload, status: 'queued' }),
      );
      expect(parserService.parse).toHaveBeenCalledWith(
        expect.objectContaining({ jobId: 'job-1', type: DocumentType.PDF }),
      );
      expect(job).toEqual({ id: 'job-1', ...payload });
    });
  });

  describe('getJobByJobId', () => {
    it('wraps the found job in the standard response envelope', async () => {
      repository.findById.mockResolvedValue({ id: 'job-1', status: 'queued' });

      const res = await service.getJobByJobId('job-1');

      expect(repository.findById).toHaveBeenCalledWith('job-1');
      expect(res).toEqual({
        id: 'job-1',
        parsedDataPath: null,
        status: 'queued',
      });
    });

    it('throws a 404 when the job is not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.getJobByJobId('missing')).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.findById).toHaveBeenCalledWith('missing');
    });
  });
});
