export const PARSE_JOB_STATUS = {
  QUEUED: 'queued',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  FAILED: 'failed',
} as const;

export type ParseJobStatus =
  (typeof PARSE_JOB_STATUS)[keyof typeof PARSE_JOB_STATUS];

export type CreateParseJobInput = {
  documentId: string;
  documentPath: string;
  tenantId: string;
  status?: ParseJobStatus;
  maxAttempts?: number;
  idempotencyKey?: string;
  metadata?: Record<string, unknown>;
};

export type UpdateParseJobStatusInput = {
  errorReason?: string | null;
  parseDataPath?: string | null;
};

export type DocumentCreatedOptions = {
  ocr?: boolean;
  forceReparse?: boolean;
};

/**
 * Payload of the `document-created` event emitted by the Document service.
 *
 * `filePath` is a MinIO object reference (URL/key), NOT the file bytes — the
 * consumer forwards it to the parser, which is responsible for fetching the
 * object. `correlationId` uniquely identifies the event and is stored as the
 * ParseJob's `idempotencyKey` to make consumption idempotent; `id` is the
 * document id.
 */
export type DocumentCreatedEvent = {
  id: string;
  name: string;
  filePath: string;
  tenantId: string;
  type: string;
  size: number;
  options?: DocumentCreatedOptions;
  correlationId: string;
  attempt?: number;
};

/** Input handed to the parser — the MinIO reference is passed straight through. */
export type ParseInput = {
  jobId: string;
  documentId: string;
  documentPath: string;
  tenantId: string;
  type: string;
  options?: DocumentCreatedOptions;
};

export type ParseResult = {
  /** File type of the parsed document (e.g. `pdf`). */
  fileType: string;
  /** Where the parsed output lives (dummy path while the parser is mocked). */
  parseDataPath: string;
  /** Parsed payload (dummy while the parser is mocked). */
  data: Record<string, unknown>;
};
