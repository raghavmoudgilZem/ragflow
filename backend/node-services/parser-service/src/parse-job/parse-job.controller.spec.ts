import { ParseJobHttpController } from './parse-job.controller';
import type { ParseJobService } from './parse-job.service';
import type { ParserService } from 'parser/parser.service';
import { CreateParserJobDto, DocumentType } from './dto/create-parse.dto';

describe('ParseJobHttpController', () => {
  const parseJobService = {
    handleNewDocument: jest.fn(),
    getJobByJobId: jest.fn(),
  };
  const parserService = { parse: jest.fn() };

  const controller = new ParseJobHttpController(
    parseJobService as unknown as ParseJobService,
    parserService as unknown as ParserService,
  );

  const dto: CreateParserJobDto = {
    documentId: 'doc-1',
    documentPath: '/bucket/doc-1.pdf',
    tenantId: 'tenant-1',
    type: DocumentType.PDF,
    options: { ocr: true },
  };

  beforeEach(() => jest.clearAllMocks());

  it('creates a parse job and returns the job id', async () => {
    parseJobService.handleNewDocument.mockResolvedValue({ id: 'job-1' });

    const res = await controller.handleDocumentParse(dto);

    expect(parseJobService.handleNewDocument).toHaveBeenCalledWith({
      documentId: 'doc-1',
      documentPath: '/bucket/doc-1.pdf',
      tenantId: 'tenant-1',
      options: { ocr: true },
      type: DocumentType.PDF,
    });
    expect(res).toEqual({ jobId: 'job-1' });
  });

  it('delegates status lookups to the service', async () => {
    const status = { id: 'job-1', status: 'completed', parsedDataPath: null };
    parseJobService.getJobByJobId.mockResolvedValue(status);

    const res = await controller.getStatus('job-1');

    expect(parseJobService.getJobByJobId).toHaveBeenCalledWith('job-1');
    expect(res).toEqual(status);
  });
});
