export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const MAX_FILES_PER_UPLOAD = 10;

export const FILE_UPLOAD_FIELD_NAME = 'files';

// Shared MIME Types dictionary
export const MIME_TYPE = {
  // Documents
  PDF: 'application/pdf',
  DOC: 'application/msword',
  DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  XLS: 'application/vnd.ms-excel',
  XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  PPT: 'application/vnd.ms-powerpoint',
  PPTX: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  TXT: 'text/plain',
  CSV: 'text/csv',
  JSON: 'application/json',

  // Images
  JPEG: 'image/jpeg',
  PNG: 'image/png',
  WEBP: 'image/webp',

  // System & Executables
  DIRECTORY: 'application/x-directory',
  MS_DOWNLOAD: 'application/x-msdownload',
} as const;

export type MimeType = (typeof MIME_TYPE)[keyof typeof MIME_TYPE];

export const ALLOWED_FILE_MIME_TYPES = new Set<string>([
  MIME_TYPE.PDF,
  MIME_TYPE.DOC,
  MIME_TYPE.DOCX,
  MIME_TYPE.XLS,
  MIME_TYPE.XLSX,
  MIME_TYPE.PPT,
  MIME_TYPE.PPTX,
  MIME_TYPE.TXT,
  MIME_TYPE.CSV,
  MIME_TYPE.JSON,
  MIME_TYPE.JPEG,
  MIME_TYPE.PNG,
  MIME_TYPE.WEBP,
]);
