import { Injectable } from '@nestjs/common';
import { StorageProvider as StorageProviderType } from '@prisma/client';
import { Readable } from 'stream';

import { ObjectAddress } from '../models/object-address';
import { StorageProviderRegistry } from '../registry/storage-provider.registry';
import { StorageConfig } from '../storage.config';

@Injectable()
export class FileStorageService {
  constructor(
    private readonly registry: StorageProviderRegistry,
    private readonly storageConfig: StorageConfig,
  ) {}

  async uploadFile(
    storageKey: string,
    stream: Readable,
    contentLength: number,
    mimeType: string,
  ): Promise<{
    provider: StorageProviderType;
    address: ObjectAddress;
  }> {
    const providerType = this.storageConfig.getDefaultProvider();
    const provider = this.registry.get(providerType);

    const address = await provider.putObject({
      bucket: this.storageConfig.getBucket(providerType),
      storageKey,
      stream,
      contentLength,
      mimeType,
    });

    return {
      provider: providerType,
      address,
    };
  }

  async deleteFile(
    providerType: StorageProviderType,
    address: ObjectAddress,
  ): Promise<void> {
    const provider = this.registry.get(providerType);

    await provider.deleteObject({
      bucket: address.bucket,
      storageKey: address.storageKey,
    });
  }
}
