import type {
  DocumentFileType,
  DocumentSource,
  DocumentParseType,
  ListDocumentsQuery,
  DocumentDetails,
  DocumentDetailsResponse,
} from "../modules/documents/document.interface.js";

import type { $Enums } from "../generated/prisma/client.js";

export const SAMPLE_USER_ID = "user1234";
export const SAMPLE_DOCUMENT_ID = "019fa803-aa88-72e8-b931-61169297eec4";
export const SAMPLE_DATASET_KB_ID = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
export const SAMPLE_WORKSPACE_ID = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
export const SAMPLE_FILE_ID = "018083f-343345-e345c";
export const SAMPLE_FILE_NAME = "Sample Book.pdf";
export const SAMPLE_FILE_SIZE_BYTES = 94158;
export const SAMPLE_NEW_DOCUMENT_REQUEST_PAYLOAD = {
  workspace_id: SAMPLE_WORKSPACE_ID,
  kb_id: SAMPLE_DATASET_KB_ID,
  file_id: SAMPLE_FILE_ID,
  name: SAMPLE_FILE_NAME,
  file_size_bytes: SAMPLE_FILE_SIZE_BYTES,
  file_type: "pdf" as DocumentFileType,
  source: "manual_upload" as $Enums.DocumentSource,
  parse_type: "book" as DocumentParseType,
};
export const SAMPLE_NEW_DOCUMENT_SAVE_DATA = {
  kbId: SAMPLE_DATASET_KB_ID,
  fileId: SAMPLE_FILE_ID,
  workspaceId: SAMPLE_WORKSPACE_ID,
  name: SAMPLE_FILE_NAME,
  fileSizeBytes: SAMPLE_FILE_SIZE_BYTES,
  fileType: "pdf" as DocumentFileType,
  parseType: "book" as DocumentParseType,
  source: "manual_upload" as DocumentSource,
  uploadedBy: SAMPLE_USER_ID,
  uploadedAt: new Date(),
};
export const SAMPLE_DOCUMENT_DB_ROW = {
  id: SAMPLE_DOCUMENT_ID,
  kbId: SAMPLE_DATASET_KB_ID,
  fileId: SAMPLE_FILE_ID,
  workspaceId: SAMPLE_WORKSPACE_ID,
  active: true,
  chunks: 0,
  name: SAMPLE_FILE_NAME,
  fileSizeBytes: SAMPLE_FILE_SIZE_BYTES,
  fileType: "pdf",
  parseType: "book",
  source: "manual_upload",
  ingestStatus: "pending",
  ingestProgressPercentage: null,
  uploadedBy: "003-87920-23444",
  uploadedAt: new Date("2026-07-16T09:27:36.514Z"),
  archivedBy: null,
  archivedAt: null,
  createdAt: new Date("2026-07-16T09:27:36.544Z"),
  updatedAt: new Date("2026-07-16T09:27:36.544Z"),
} as any;
export const SAMPLE_ERROR_MESSAGE = "simulated error";
export const SAMPLE_REQUEST_ID = "req1234";
export const SAMPLE_FILE_CHAIN_VALIDATION_INPUT = {
  userId: SAMPLE_USER_ID,
  workspaceId: "ws_1",
  kbId: "kb_1",
  fileId: "file_1",
};
export const SAMPLE_LIST_DOCUMENTS_QUERY: ListDocumentsQuery = {
  datasetId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
  page: 1,
  pageSize: 10,
  search: "pending",
  sort: "uploadedAt",
};
export const SAMPLE_PAGINATED_DOCUMENTS = {
  documents: [
    SAMPLE_DOCUMENT_DB_ROW,
  ],
  total: 1,
  page: 1,
  pageSize: 10,
};
export const SAMPLE_DOCUMENT_DETAILS: DocumentDetails = {
  id: SAMPLE_DOCUMENT_ID,
  workspaceId: SAMPLE_WORKSPACE_ID,
  kbId: SAMPLE_DATASET_KB_ID,
  fileId: SAMPLE_FILE_ID,
  name: SAMPLE_FILE_NAME,
  fileSizeBytes: BigInt(SAMPLE_FILE_SIZE_BYTES),
  fileType: "pdf",
  source: "manual_upload",
  parseType: "book",
  chunks: 0,
  ingestStatus: "pending",
  ingestProgressPercentage: null,
  uploadedBy: SAMPLE_USER_ID,
  uploadedAt: new Date(),
};
export const SAMPLE_DOCUMENT_DETAILS_RESPONSE: DocumentDetailsResponse = {
  id: SAMPLE_DOCUMENT_ID,
  workspaceId: SAMPLE_WORKSPACE_ID,
  kbId: SAMPLE_DATASET_KB_ID,
  fileId: SAMPLE_FILE_ID,
  name: SAMPLE_FILE_NAME,
  fileSizeBytes: SAMPLE_FILE_SIZE_BYTES,
  fileType: "pdf",
  source: "manual_upload",
  parseType: "book",
  chunks: 0,
  ingestStatus: "pending",
  ingestProgressPercentage: null,
  uploadedBy: SAMPLE_USER_ID,
  uploadedAt: new Date(),
};
