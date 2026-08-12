import {
  DOC_FILE_TYPES,
  DOC_SOURCE,
  DOC_PARSE_TYPE_OPTIONS,
} from "../../config/constants.js";
import type { Document, Prisma } from "../../generated/prisma/client.js";

export type DocumentFileType = (typeof DOC_FILE_TYPES)[number];

export type DocumentSource = (typeof DOC_SOURCE)[number];

export type DocumentParseType = (typeof DOC_PARSE_TYPE_OPTIONS)[number];

import type { $Enums } from "../../generated/prisma/client.js";
export interface NewDocumentRequestPayload {
  workspace_id: string;
  kb_id: string;
  file_id: string;
  name: string;
  file_size_bytes: number;
  file_type: DocumentFileType;
  source: $Enums.DocumentSource;
  parse_type: DocumentParseType;
}

export interface FileOwnershipChainValidationProps {
  workspaceId: string;
  kbId: string;
  fileId: string;
  userId: string;
}

export interface DocumentId {
  id: string;
}

export type DocumentSortField =
  | "uploadedAt"
  | "createdAt"
  | "updatedAt"
  | "name";

export type DocumentStatus =
  | "pending"
  | "in_queue"
  | "in_progress"
  | "completed"
  | "failed"
  | "cancelled"

export interface ListDocumentsQuery {
  datasetId: string;
  page: number;
  pageSize: number;
  search?: string;
  status?: $Enums.IngestStatus;
  sort?: DocumentSortField;
  order?: Prisma.SortOrder;
}

export interface PaginatedDocuments {
  documents: Document[];
  total: number;
  page: number;
  pageSize: number;
}

export interface DocumentResponse {
  id: string;
  name: string;
  fileSizeBytes: number;
  fileType: string;
  ingestStatus: string;
  uploadedAt: Date | null;
}

export interface GetDocumentParams {
  datasetId: string;
  documentId: string;
}

export interface DocumentDetails {
  id: string;
  workspaceId: string;
  kbId: string;
  fileId: string;
  name: string;
  fileSizeBytes: bigint;
  fileType: string;
  source: $Enums.DocumentSource | null;
  parseType: string;
  chunks: number;
  ingestStatus: $Enums.IngestStatus;
  ingestProgressPercentage: number | null;
  uploadedBy: string;
  uploadedAt: Date | null;
}

export interface DocumentDetailsResponse {
  id: string;
  workspaceId: string;
  kbId: string;
  fileId: string;
  name: string;
  fileSizeBytes: number;
  fileType: string;
  source: $Enums.DocumentSource | null;
  parseType: string;
  chunks: number;
  ingestStatus: $Enums.IngestStatus;
  ingestProgressPercentage: number | null;
  uploadedBy: string;
  uploadedAt: Date | null;
}

export interface UpdateDocumentRequest {
  name: string;
}
