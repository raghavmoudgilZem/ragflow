export type ParseType = 'built-in' | 'pipeline';

export interface EmbeddingModel {
  id: string;
  name: string;
}

export interface ChunkingMethod {
  id: string;
  label: string;
}

export interface Pipeline {
  id: string;
  name: string;
}

export interface CreateDatasetPayload {
  name: string;
  embeddingModel: string;
  parseType: ParseType;
  chunkingMethod?: string;
  pipelineId?: string;
}

export interface Dataset {
  id: string;
  name: string;
  fileCount: number;
  createdAt: string;
}

export interface PaginatedDatasetResponse {
  items: Dataset[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
