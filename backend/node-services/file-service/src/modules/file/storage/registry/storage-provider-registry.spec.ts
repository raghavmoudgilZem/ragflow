import { StorageProvider as StorageProviderType } from '@prisma/client';

import { StorageProviderRegistry } from './storage-provider.registry';
import { LocalStorageProvider } from '../providers/local-storage.provider';
import { MinioStorageProvider } from '../providers/minio-storage.provider';
import { S3StorageProvider } from '../providers/s3-storage.provider';

describe('StorageProviderRegistry', () => {
  let registry: StorageProviderRegistry;

  let localStorageProvider: jest.Mocked<LocalStorageProvider>;
  let minioStorageProvider: jest.Mocked<MinioStorageProvider>;
  let s3StorageProvider: jest.Mocked<S3StorageProvider>;

  beforeEach(() => {
    localStorageProvider = {
      type: 'LOCAL',
    } as jest.Mocked<LocalStorageProvider>;

    minioStorageProvider = {
      type: 'MINIO',
    } as jest.Mocked<MinioStorageProvider>;

    s3StorageProvider = {
      type: 'S3',
    } as jest.Mocked<S3StorageProvider>;

    registry = new StorageProviderRegistry(
      localStorageProvider,
      minioStorageProvider,
      s3StorageProvider,
    );
  });
  it('should return Local storage provider', () => {
    expect(registry.get(StorageProviderType.LOCAL)).toBe(localStorageProvider);
  });

  it('should expose Local provider type', () => {
    expect(localStorageProvider.type).toBe('LOCAL');
  });

  it('should return MinIO storage provider', () => {
    expect(registry.get(StorageProviderType.MINIO)).toBe(minioStorageProvider);
  });

  it('should expose MinIO provider type', () => {
    expect(minioStorageProvider.type).toBe('MINIO');
  });

  it('should return S3 storage provider', () => {
    expect(registry.get(StorageProviderType.S3)).toBe(s3StorageProvider);
  });

  it('should expose S3 provider type', () => {
    expect(s3StorageProvider.type).toBe('S3');
  });
});
