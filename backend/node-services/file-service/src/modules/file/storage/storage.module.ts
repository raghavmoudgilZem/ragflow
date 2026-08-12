import { Module } from '@nestjs/common';

import { LocalStorageProvider } from './providers/local-storage.provider';
import { MinioStorageProvider } from './providers/minio-storage.provider';
import { S3StorageProvider } from './providers/s3-storage.provider';
import { StorageProviderRegistry } from './registry/storage-provider.registry';

@Module({
  providers: [
    LocalStorageProvider,
    MinioStorageProvider,
    S3StorageProvider,
    StorageProviderRegistry,
  ],
  exports: [StorageProviderRegistry],
})
export class StorageModule {}
