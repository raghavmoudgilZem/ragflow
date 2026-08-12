export interface ChunkMetadata {
  page?: number;
  section?: string;
  keywords?: string[];
  tags?: string[];
  contentType?: string;
}

export interface Chunk {
  id: string;
  documentId: string;
  content: string;
  metadata: ChunkMetadata;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  thumbnailUrl?: string | null;
}

export interface ChunkQueryParams {
  documentId: string;
  page: number;
  pageSize: number;
  search?: string;
  enabled?: boolean;
}

export interface CreateChunkPayload {
  documentId: string;
  content: string;
  metadata?: ChunkMetadata;
}

export interface UpdateChunkPayload {
  content?: string;
  metadata?: ChunkMetadata;
  enabled?: boolean;
}

export interface PaginatedChunkResponse {
  items: Chunk[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface LayoutBox {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MarkdownBlock {
  id: string;
  content: string;
  type: string;
}

export interface ParsedResult {
  documentId: string;
  content: string;
  layoutBoxes: LayoutBox[];
  markdownBlocks: MarkdownBlock[];
}

export interface DocumentDetail {
  id: string;
  datasetId: string;
  datasetName: string;
  name: string;
  sizeLabel: string;
  sizeInBytes: number;
  uploadedAt: string;
  chunkCount: number;
  previewTitle: string;
  previewSubtitle: string;
}

export type ChunkViewMode = 'full' | 'ellipsis';

export type ChunkEnabledFilter = 'all' | 'enabled' | 'disabled';
