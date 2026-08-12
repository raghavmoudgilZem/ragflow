export const IngestionStatus = {
  Unstart: '0',
  Running: '1',
  Cancel: '2',
  Done: '3',
  Fail: '4',
  Schedule: '5',
} as const;

export type IngestionStatus =
  (typeof IngestionStatus)[keyof typeof IngestionStatus];

export const PROGRESS_FAILED = -1;

export const PROGRESS_COMPLETE = 1;

export interface DocumentProgress {
  id: string;
  name: string;
  run: IngestionStatus;
  progress: number;
  progress_msg: string;
  chunk_num: number;
  token_num: number;
  process_duration: number;
}

export interface DocumentProgressListResponse {
  total: number;
  docs: DocumentProgress[];
}

export interface DocumentProgressListParams {
  page: number;
  pageSize: number;
  keywords?: string;
}

export interface IngestionSummary {
  doc_num: number;
  chunk_num: number;
  token_num: number;
  finished: number;
  processing: number;
  failed: number;
}

export interface IngestionLog {
  id: string;
  document_name: string;
  run: IngestionStatus;
  message: string;
  create_time: number;
  duration: number;
}

export interface IngestionLogListResponse {
  total: number;
  logs: IngestionLog[];
}

export interface IngestionLogListParams {
  page: number;
  pageSize: number;
  keywords?: string;
  status?: IngestionStatus;
}
