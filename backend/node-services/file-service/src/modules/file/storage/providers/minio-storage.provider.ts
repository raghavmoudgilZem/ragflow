import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'minio';

import { StorageProvider } from '../interfaces/storage-provider.interface';
import { DeleteObjectInput } from '../models/delete-object.input';
import { GetObjectInput } from '../models/get-object.input';
import { ObjectAddress } from '../models/object-address';
import { PutObjectInput } from '../models/put-object.input';

@Injectable()
export class MinioStorageProvider implements StorageProvider, OnModuleInit {
  readonly type = 'MINIO';

  private readonly client: Client;
  private readonly logger = new Logger(MinioStorageProvider.name);

  constructor(private readonly configService: ConfigService) {
    this.client = new Client({
      endPoint: this.configService.get<string>('storage.minio.endpoint'),
      port: this.configService.get<number>('storage.minio.port'),
      useSSL: this.configService.get<boolean>('storage.minio.useSSL'),
      accessKey: this.configService.get<string>('storage.minio.accessKey'),
      secretKey: this.configService.get<string>('storage.minio.secretKey'),
    });
  }

  async onModuleInit(): Promise<void> {
    this.logger.log('Initializing MinIO client...');
    const bucket = this.configService.get<string>('storage.minio.bucket');

    try {
      const exists = await this.client.bucketExists(bucket);

      if (!exists) {
        this.logger.log(`Bucket '${bucket}' does not exist. Creating...`);

        await this.client.makeBucket(bucket);

        this.logger.log(`Bucket '${bucket}' created successfully.`);
      } else {
        this.logger.log(`Bucket '${bucket}' already exists.`);
      }

      this.logger.log('Connected to MinIO successfully.');
    } catch (error) {
      this.logger.error(
        'Failed to initialize MinIO provider.',
        error instanceof Error ? error.stack : undefined,
      );

      throw error;
    }
  }

  async putObject(input: PutObjectInput): Promise<ObjectAddress> {
    this.logger.log(
      `Starting upload to bucket: ${input.bucket}, key: ${input.storageKey}`,
    );
    await this.client.putObject(
      input.bucket,
      input.storageKey,
      input.stream,
      input.contentLength,
      {
        'Content-Type': input.mimeType,
      },
    );
    this.logger.log(
      `Successfully uploaded object to bucket: ${input.bucket}, key: ${input.storageKey}`,
    );

    return {
      bucket: input.bucket,
      storageKey: input.storageKey,
    };
  }

  async getObject(input: GetObjectInput): Promise<NodeJS.ReadableStream> {
    this.logger.log(
      `Fetching object from bucket: ${input.bucket}, key: ${input.storageKey}`,
    );
    return this.client.getObject(input.bucket, input.storageKey);
  }

  async deleteObject(input: DeleteObjectInput): Promise<void> {
    this.logger.log(
      `Attempting to delete object from bucket: ${input.bucket}, key: ${input.storageKey}`,
    );
    await this.client.removeObject(input.bucket, input.storageKey);
    this.logger.log(
      `Successfully deleted object from bucket: ${input.bucket}, key: ${input.storageKey}`,
    );
  }

  async objectExists(input: GetObjectInput): Promise<boolean> {
    this.logger.log(
      `Checking if object exists in bucket: ${input.bucket}, key: ${input.storageKey}`,
    );
    try {
      await this.client.statObject(input.bucket, input.storageKey);
      this.logger.log(
        `Object found in bucket: ${input.bucket}, key: ${input.storageKey}`,
      );

      return true;
    } catch {
      this.logger.log(
        `Object not found (or error checking) in bucket: ${input.bucket}, key: ${input.storageKey}`,
      );
      return false;
    }
  }
}
