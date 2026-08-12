import * as path from 'path';
import * as crypto from 'crypto';

export class FileHelper {
  static generateFileName(originalName: string): string {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(originalName);
    const nameWithoutExt = path.basename(originalName, ext);
    return `${nameWithoutExt}-${timestamp}-${randomString}${ext}`;
  }

  static getFileExtension(filename: string): string {
    return path.extname(filename).toLowerCase();
  }

  static getMimeType(filename: string): string {
    const ext = this.getFileExtension(filename);
    const mimeTypes: { [key: string]: string } = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain',
      '.csv': 'text/csv',
      '.json': 'application/json',
      '.xml': 'application/xml',
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  static isValidFileType(filename: string, allowedTypes: string[]): boolean {
    const ext = this.getFileExtension(filename);
    return allowedTypes.includes(ext);
  }
}
