import { Injectable } from '@nestjs/common';
import { StorageProvider as StorageProviderType } from '@prisma/client';

import { StorageProvider } from '../interfaces/storage-provider.interface';
import { LocalStorageProvider } from '../providers/local-storage.provider';
import { MinioStorageProvider } from '../providers/minio-storage.provider';
import { S3StorageProvider } from '../providers/s3-storage.provider';

@Injectable()
export class StorageProviderRegistry {
  constructor(
    private readonly localStorageProvider: LocalStorageProvider,
    private readonly minioStorageProvider: MinioStorageProvider,
    private readonly s3StorageProvider: S3StorageProvider,
  ) {}

  get(provider: StorageProviderType): StorageProvider {
    switch (provider) {
      case StorageProviderType.LOCAL:
        return this.localStorageProvider;

      case StorageProviderType.MINIO:
        return this.minioStorageProvider;
      case StorageProviderType.S3:
        return this.s3StorageProvider;

      default:
        throw new Error(`Storage provider '${provider}' is not supported.`);
    }
  }
}
