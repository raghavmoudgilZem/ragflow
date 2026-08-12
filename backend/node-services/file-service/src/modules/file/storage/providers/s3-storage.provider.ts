import { Injectable } from '@nestjs/common';

import { StorageProvider } from '../interfaces/storage-provider.interface';
import { DeleteObjectInput } from '../models/delete-object.input';
import { GetObjectInput } from '../models/get-object.input';
import { ObjectAddress } from '../models/object-address';
import { PutObjectInput } from '../models/put-object.input';

@Injectable()
export class S3StorageProvider implements StorageProvider {
  readonly type = 'S3';

  async putObject(_: PutObjectInput): Promise<ObjectAddress> {
    throw new Error('S3 provider not implemented.');
  }

  async getObject(_: GetObjectInput): Promise<NodeJS.ReadableStream> {
    throw new Error('S3 provider not implemented.');
  }

  async deleteObject(_: DeleteObjectInput): Promise<void> {
    throw new Error('S3 provider not implemented.');
  }

  async objectExists(_: GetObjectInput): Promise<boolean> {
    throw new Error('S3 provider not implemented.');
  }
}
