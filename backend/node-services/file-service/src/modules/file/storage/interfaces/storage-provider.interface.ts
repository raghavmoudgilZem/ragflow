import { DeleteObjectInput } from '../models/delete-object.input';
import { GetObjectInput } from '../models/get-object.input';
import { ObjectAddress } from '../models/object-address';
import { PutObjectInput } from '../models/put-object.input';

export interface StorageProvider {
  readonly type: string;

  putObject(input: PutObjectInput): Promise<ObjectAddress>;

  getObject(input: GetObjectInput): Promise<NodeJS.ReadableStream>;

  deleteObject(input: DeleteObjectInput): Promise<void>;

  objectExists(input: GetObjectInput): Promise<boolean>;
}
