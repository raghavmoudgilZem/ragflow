import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageProvider as StorageProviderType } from '@prisma/client';

@Injectable()
export class StorageConfig {
  constructor(private readonly configService: ConfigService) {}

  getDefaultProvider(): StorageProviderType {
    return this.configService.get<StorageProviderType>(
      'storage.defaultProvider',
    );
  }

  getBucket(provider: StorageProviderType): string | null {
    switch (provider) {
      case StorageProviderType.MINIO:
        return this.configService.get<string>('storage.minio.bucket');

      case StorageProviderType.LOCAL:
        return null;

      case StorageProviderType.S3:
        return this.configService.get<string>('storage.s3.bucket');

      default:
        throw new Error(`Unsupported storage provider: ${provider}`);
    }
  }
}
