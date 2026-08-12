import { Readable } from 'stream';

export class PutObjectInput {
  bucket: string;

  storageKey: string;

  stream: Readable;

  contentLength: number;

  mimeType: string;
}
