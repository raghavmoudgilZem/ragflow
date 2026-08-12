import { MIME_TYPE } from '../../src/common/constants/file.constants';

export class FileFixtures {
  static readonly rootUpload = {
    fileName: 'sample.pdf',
    mimeType: MIME_TYPE.PDF,
    content: Buffer.from('Sample PDF content'),
  };

  static readonly nestedUpload = {
    fileName: 'nested-document.pdf',
    mimeType: MIME_TYPE.PDF,
    content: Buffer.from('Nested folder document'),
  };

  static readonly duplicateUpload = {
    fileName: 'duplicate.pdf',
    mimeType: MIME_TYPE.PDF,
    content: Buffer.from('Duplicate file'),
  };

  static readonly invalidMimeUpload = {
    fileName: 'malware.exe',
    mimeType: MIME_TYPE.MS_DOWNLOAD,
    content: Buffer.from('Executable'),
  };

  static createLargeFile(sizeInBytes: number): Buffer {
    return Buffer.alloc(sizeInBytes, 'A');
  }
}
