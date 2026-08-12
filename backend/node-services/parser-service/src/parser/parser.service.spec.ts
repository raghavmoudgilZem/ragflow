import { ParserService } from './parser.service';
import type { ParseJobRepository } from 'parse-job/parse-job.repository';

describe('ParserService', () => {
  const repository = {
    updateStatus: jest.fn().mockResolvedValue({ id: 'job-1' }),
  } as unknown as ParseJobRepository;

  const service = new ParserService(repository);

  beforeEach(() => jest.clearAllMocks());

  const parse = (type: string, documentPath = '/bucket/doc.pdf') =>
    service.parse({
      jobId: 'job-1',
      documentId: 'doc-1',
      documentPath,
      tenantId: 'tenant-1',
      type,
    });

  it.each([
    ['pdf', 'pdf'],
    ['docx', 'docx'],
    ['txt', 'txt'],
    ['csv', 'csv'],
    ['xyz', 'xyz'],
  ])('uses the event file type %s', async (type, expected) => {
    const result = await parse(type);
    expect(result.fileType).toBe(expected);
  });

  it('is case-insensitive about the file type', async () => {
    const result = await parse('PDF');
    expect(result.fileType).toBe('pdf');
    expect(result.data.kind).toBe('pdf');
  });

  it('falls back to the documentPath extension when type is empty', async () => {
    const result = await parse('', '/bucket/doc.txt');
    expect(result.fileType).toBe('txt');
  });

  it('derives parseDataPath by swapping the extension to .json', async () => {
    const result = await parse('pdf', '/bucket/doc.pdf');
    expect(result.parseDataPath).toBe('/bucket/doc.json');
  });

  it('falls back to "unknown" when type and extension are absent', async () => {
    const result = await parse('', '/bucket/doc');
    expect(result.fileType).toBe('unknown');
    expect(result.data.kind).toBe('unknown');
  });

  it('returns a non-empty data payload', async () => {
    const result = await parse('txt');
    expect(Object.keys(result.data).length).toBeGreaterThan(0);
  });

  it('marks the job successful with the uploaded parse-data path', async () => {
    await parse('pdf');
    expect(repository.updateStatus).toHaveBeenCalledWith(
      'job-1',
      'success',
      expect.objectContaining({
        parseDataPath: expect.stringContaining('/job-1.json'),
      }),
    );
  });
});
