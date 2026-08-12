import { ConfigService } from '@nestjs/config';
import { Readable, Writable } from 'stream';

import * as fs from 'node:fs';
import { promises as fsPromises } from 'node:fs';

import { LocalStorageProvider } from './local-storage.provider';

jest.mock('node:fs', () => {
  const actualFs = jest.requireActual('node:fs');

  return {
    ...actualFs,
    createWriteStream: jest.fn(),
    createReadStream: jest.fn(),
    promises: {
      mkdir: jest.fn(),
      rm: jest.fn(),
      access: jest.fn(),
    },
  };
});

describe('LocalStorageProvider', () => {
  let provider: LocalStorageProvider;
  let configService: ConfigService;

  beforeEach(() => {
    jest.clearAllMocks();

    configService = {
      get: jest.fn().mockReturnValue('/tmp/storage'),
    } as unknown as ConfigService;

    provider = new LocalStorageProvider(configService);
  });

  it('should create provider', () => {
    expect(provider).toBeDefined();
    expect(provider.type).toBe('LOCAL');
  });

  it('should upload object', async () => {
    const writeStream = new Writable({
      write(_chunk, _encoding, callback) {
        callback();
      },
    });

    jest.spyOn(fs, 'createWriteStream').mockReturnValue(writeStream as any);

    const mkdirSpy = jest
      .spyOn(fsPromises, 'mkdir')
      .mockResolvedValue(undefined);

    const buffer = Buffer.from('hello');

    const stream = Readable.from([buffer]);

    const promise = provider.putObject({
      bucket: 'local',
      storageKey: 'folder/file.txt',
      stream,
      contentLength: buffer.length,
      mimeType: 'text/plain',
    });

    writeStream.emit('finish');

    const result = await promise;

    expect(mkdirSpy).toHaveBeenCalled();

    expect(fs.createWriteStream).toHaveBeenCalledWith(
      '/tmp/storage/folder/file.txt',
    );

    expect(result).toEqual({
      bucket: 'local',
      storageKey: 'folder/file.txt',
    });
  });

  it('should return readable stream', async () => {
    const readable = Readable.from(['hello']);

    jest.spyOn(fs, 'createReadStream').mockReturnValue(readable as any);

    const result = await provider.getObject({
      bucket: 'local',
      storageKey: 'folder/file.txt',
    });

    expect(fs.createReadStream).toHaveBeenCalled();

    expect(result).toBe(readable);
  });

  it('should delete object', async () => {
    const rmSpy = jest.spyOn(fsPromises, 'rm').mockResolvedValue(undefined);

    await provider.deleteObject({
      bucket: 'local',
      storageKey: 'folder/file.txt',
    });

    expect(rmSpy).toHaveBeenCalledWith('/tmp/storage/folder/file.txt', {
      force: true,
    });
  });

  it('should return true when object exists', async () => {
    jest.spyOn(fsPromises, 'access').mockResolvedValue(undefined);

    const exists = await provider.objectExists({
      bucket: 'local',
      storageKey: 'folder/file.txt',
    });

    expect(exists).toBe(true);
  });

  it('should return false when object does not exist', async () => {
    jest.spyOn(fsPromises, 'access').mockRejectedValue(new Error());

    const exists = await provider.objectExists({
      bucket: 'local',
      storageKey: 'folder/file.txt',
    });

    expect(exists).toBe(false);
  });

  it('should reject path traversal attack', async () => {
    await expect(
      provider.objectExists({
        bucket: 'local',
        storageKey: '../../../etc/passwd',
      }),
    ).rejects.toThrow('Invalid storage path.');
  });
});
