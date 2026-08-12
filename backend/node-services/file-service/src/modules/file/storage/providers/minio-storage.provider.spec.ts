import { ConfigService } from '@nestjs/config';
import { Client } from 'minio';
import { Readable } from 'stream';

import { MinioStorageProvider } from './minio-storage.provider';

jest.mock('minio', () => {
  const mockClient = {
    bucketExists: jest.fn(),
    makeBucket: jest.fn(),
    putObject: jest.fn(),
    getObject: jest.fn(),
    removeObject: jest.fn(),
    statObject: jest.fn(),
  };

  return {
    Client: jest.fn(() => mockClient),
  };
});

describe('MinioStorageProvider', () => {
  let provider: MinioStorageProvider;
  let configService: ConfigService;
  let client: any;

  beforeEach(() => {
    configService = {
      get: jest.fn((key: string) => {
        const values = {
          'storage.minio.endpoint': 'localhost',
          'storage.minio.port': 9000,
          'storage.minio.useSSL': false,
          'storage.minio.accessKey': 'rag_flow',
          'storage.minio.secretKey': 'rag_flow',
          'storage.minio.bucket': 'rag-files',
        };

        return values[key as keyof typeof values];
      }),
    } as unknown as ConfigService;

    provider = new MinioStorageProvider(configService);

    client = (provider as any).client;
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should not create bucket when bucket already exists', async () => {
    client.bucketExists.mockResolvedValue(true);

    await provider.onModuleInit();

    expect(client.bucketExists).toHaveBeenCalledWith('rag-files');
    expect(client.makeBucket).not.toHaveBeenCalled();
  });

  it('should create bucket when it does not exist', async () => {
    client.bucketExists.mockResolvedValue(false);

    await provider.onModuleInit();

    expect(client.bucketExists).toHaveBeenCalledWith('rag-files');
    expect(client.makeBucket).toHaveBeenCalledWith('rag-files');
  });

  it('should throw when bucket check fails', async () => {
    client.bucketExists.mockRejectedValue(new Error('Connection failed'));

    await expect(provider.onModuleInit()).rejects.toThrow('Connection failed');
  });

  it('should upload object', async () => {
    client.putObject.mockResolvedValue(undefined);

    const buffer = Buffer.from('hello');
    const stream = Readable.from([buffer]);

    const result = await provider.putObject({
      bucket: 'rag-files',
      storageKey: 'hello.txt',
      stream,
      contentLength: buffer.length,
      mimeType: 'text/plain',
    });

    expect(client.putObject).toHaveBeenCalledWith(
      'rag-files',
      'hello.txt',
      stream,
      buffer.length,
      {
        'Content-Type': 'text/plain',
      },
    );

    expect(result).toEqual({
      bucket: 'rag-files',
      storageKey: 'hello.txt',
    });
    stream.destroy();
  });

  it('should download object', async () => {
    const readable = Readable.from(['hello']);

    client.getObject.mockResolvedValue(readable);

    const result = await provider.getObject({
      bucket: 'rag-files',
      storageKey: 'hello.txt',
    });

    expect(client.getObject).toHaveBeenCalledWith('rag-files', 'hello.txt');

    expect(result).toBe(readable);
    readable.destroy();
  });

  it('should delete object', async () => {
    client.removeObject.mockResolvedValue(undefined);

    await provider.deleteObject({
      bucket: 'rag-files',
      storageKey: 'hello.txt',
    });

    expect(client.removeObject).toHaveBeenCalledWith('rag-files', 'hello.txt');
  });

  it('should return true when object exists', async () => {
    client.statObject.mockResolvedValue({});

    const exists = await provider.objectExists({
      bucket: 'rag-files',
      storageKey: 'hello.txt',
    });

    expect(client.statObject).toHaveBeenCalledWith('rag-files', 'hello.txt');

    expect(exists).toBe(true);
  });

  it('should return false when object does not exist', async () => {
    client.statObject.mockRejectedValue(new Error());

    const exists = await provider.objectExists({
      bucket: 'rag-files',
      storageKey: 'hello.txt',
    });

    expect(client.statObject).toHaveBeenCalledWith('rag-files', 'hello.txt');

    expect(exists).toBe(false);
  });
});
