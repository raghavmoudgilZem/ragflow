import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import * as fs from 'node:fs';
import { promises as fsPromises } from 'node:fs';
import * as path from 'node:path';

import { StorageProvider } from '../interfaces/storage-provider.interface';
import { DeleteObjectInput } from '../models/delete-object.input';
import { GetObjectInput } from '../models/get-object.input';
import { ObjectAddress } from '../models/object-address';
import { PutObjectInput } from '../models/put-object.input';

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  readonly type = 'LOCAL';

  private readonly rootPath: string;
  private readonly logger = new Logger(LocalStorageProvider.name);

  constructor(private readonly configService: ConfigService) {
    this.rootPath = this.configService.get<string>(
      'storage.local.storagePath',
    )!;
    this.logger.log(
      `LocalStorageProvider initialized. Root path: ${this.rootPath}`,
    );
  }

  async putObject(input: PutObjectInput): Promise<ObjectAddress> {
    this.logger.log(
      `Starting file upload for storageKey: ${input.storageKey} in bucket: ${input.bucket}`,
    );
    const filePath = this.resolvePath(input.storageKey);

    await fsPromises.mkdir(path.dirname(filePath), { recursive: true });

    const writeStream = fs.createWriteStream(filePath);

    await new Promise<void>((resolve, reject) => {
      input.stream.pipe(writeStream);

      writeStream.on('finish', () => {
        this.logger.log(`Successfully wrote file to disk: ${filePath}`);
        resolve();
      });

      writeStream.on('error', (error) => {
        this.logger.error(
          `Write stream error for file ${filePath}`,
          error instanceof Error ? error.stack : undefined,
        );
        reject(error);
      });

      input.stream.on('error', (error) => {
        this.logger.error(
          `Incoming stream error for storageKey: ${input.storageKey}`,
          error instanceof Error ? error.stack : undefined,
        );
        reject(error);
      });
    });

    return {
      bucket: input.bucket,
      storageKey: input.storageKey,
    };
  }

  async getObject(input: GetObjectInput): Promise<NodeJS.ReadableStream> {
    this.logger.log(`Creating read stream for storageKey: ${input.storageKey}`);
    return fs.createReadStream(this.resolvePath(input.storageKey));
  }

  async deleteObject(input: DeleteObjectInput): Promise<void> {
    this.logger.log(
      `Attempting to delete file for storageKey: ${input.storageKey}`,
    );
    const filePath = this.resolvePath(input.storageKey);

    await fsPromises.rm(filePath, {
      force: true,
    });
    this.logger.log(`Successfully removed file from disk: ${filePath}`);
  }

  async objectExists(input: GetObjectInput): Promise<boolean> {
    this.logger.log(
      `Checking if file exists for storageKey: ${input.storageKey}`,
    );
    const filePath = this.resolvePath(input.storageKey);

    try {
      await fsPromises.access(filePath);
      this.logger.log(`File exists: ${filePath}`);

      return true;
    } catch {
      this.logger.log(`File does not exist: ${filePath}`);
      return false;
    }
  }

  private resolvePath(storageKey: string): string {
    const resolvedPath = path.resolve(this.rootPath, storageKey);
    const rootPath = path.resolve(this.rootPath);

    if (!resolvedPath.startsWith(rootPath)) {
      this.logger.error(
        `Path traversal protection triggered! Attempted key: ${storageKey}`,
      );
      throw new Error('Invalid storage path.');
    }

    return resolvedPath;
  }
}
