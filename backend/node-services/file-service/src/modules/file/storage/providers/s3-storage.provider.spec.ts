import { S3StorageProvider } from './s3-storage.provider';

describe('S3StorageProvider', () => {
  let provider: S3StorageProvider;

  beforeEach(() => {
    provider = new S3StorageProvider();
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
    expect(provider.type).toBe('S3');
  });

  it('should throw for putObject', async () => {
    await expect(provider.putObject({} as any)).rejects.toThrow(
      'S3 provider not implemented.',
    );
  });

  it('should throw for getObject', async () => {
    await expect(provider.getObject({} as any)).rejects.toThrow(
      'S3 provider not implemented.',
    );
  });

  it('should throw for deleteObject', async () => {
    await expect(provider.deleteObject({} as any)).rejects.toThrow(
      'S3 provider not implemented.',
    );
  });

  it('should throw for objectExists', async () => {
    await expect(provider.objectExists({} as any)).rejects.toThrow(
      'S3 provider not implemented.',
    );
  });
});
