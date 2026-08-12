import { Injectable } from '@nestjs/common';
import { StorageProvider as StorageProviderType } from '@prisma/client';
import { Readable } from 'stream';

import { ObjectAddress } from '../models/object-address';
import { PutObjectInput } from '../models/put-object.input';
import { StorageProviderRegistry } from '../registry/storage-provider.registry';
import { StorageConfig } from '../storage.config';
import { StorageKeyBuilder } from '../builders/storage-key.builder';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FolderStorageService {
  constructor(
    private readonly registry: StorageProviderRegistry,
    private readonly storageConfig: StorageConfig,
    private readonly storageKeyBuilder: StorageKeyBuilder,
    private readonly configService: ConfigService,
  ) {}

  async createRootFolder(
    tenantId: string,
    folderName: string,
  ): Promise<{
    provider: StorageProviderType;
    address: ObjectAddress;
  }> {
    const providerType = this.storageConfig.getDefaultProvider();

    const provider = this.registry.get(providerType);

    const storageKey = this.storageKeyBuilder.buildRootFolderKey(
      tenantId,
      folderName,
    );

    let address: ObjectAddress;

    if (providerType === StorageProviderType.LOCAL) {
      const localRoot = this.configService.get<string>(
        'storage.local.storagePath',
      );

      const folderPath = path.join(localRoot, storageKey);

      await fs.mkdir(folderPath, {
        recursive: true,
      });

      address = {
        bucket: '',
        storageKey,
      };
    } else {
      address = await provider.putObject({
        bucket: this.storageConfig.getBucket(providerType),
        storageKey,
        stream: Readable.from(Buffer.alloc(0)),
        contentLength: 0,
        mimeType: 'application/x-directory',
      });
    }

    return {
      provider: providerType,
      address,
    };
  }

  async createChildFolder(
    parentStorageKey: string,
    folderName: string,
  ): Promise<{
    provider: StorageProviderType;
    address: ObjectAddress;
  }> {
    const providerType = this.storageConfig.getDefaultProvider();

    const provider = this.registry.get(providerType);

    const storageKey = this.storageKeyBuilder.buildChildFolderKey(
      parentStorageKey,
      folderName,
    );

    let address: ObjectAddress;

    if (providerType === StorageProviderType.LOCAL) {
      const localRoot = this.configService.get<string>(
        'storage.local.storagePath',
      );

      await fs.mkdir(path.join(localRoot, storageKey), {
        recursive: true,
      });

      address = {
        bucket: '',
        storageKey,
      };
    } else {
      address = await provider.putObject({
        bucket: this.storageConfig.getBucket(providerType),
        storageKey,
        stream: Readable.from(Buffer.alloc(0)),
        contentLength: 0,
        mimeType: 'application/x-directory',
      });
    }

    return {
      provider: providerType,
      address,
    };
  }
  async deleteFolder(
    providerType: StorageProviderType,
    address: ObjectAddress,
  ): Promise<void> {
    const provider = this.registry.get(providerType);

    if (providerType === StorageProviderType.LOCAL) {
      const localRoot = this.configService.get<string>(
        'storage.local.storagePath',
      );

      await fs.rm(path.join(localRoot, address.storageKey), {
        recursive: true,
        force: true,
      });

      return;
    }

    await provider.deleteObject({
      bucket: address.bucket,
      storageKey: address.storageKey,
    });
  }
}
