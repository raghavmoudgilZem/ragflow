export interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

export interface SearchAppSettings {
  datasets: string[];
  show_chunk_metadata: boolean;
  similarity_threshold: number;
  vector_similarity_weight: number;
  full_text_similarity_weight: number;
  rerank_model?: string;
  ai_summary?: boolean;
  enable_related_search?: boolean;
  show_query_mindmap?: boolean;
}

export interface SearchApp {
  id: string;
  name: string;
  description?: string;
  create_time: number;
  settings?: SearchAppSettings;
}

export interface SearchAppListData {
  search_apps: SearchApp[];
  total: number;
}

export interface CreateSearchAppRequest {
  name: string;
  description?: string;
}

export interface UpdateSearchAppRequest {
  name?: string;
  description?: string;
  settings?: SearchAppSettings;
}

export interface SearchExecuteRequest {
  highlight: boolean;
  question: string;
  page: number;
  size: number;
  search_id: string;
  tenant_id: string | null;
  dataset_ids: string[];
}

export interface SearchChunk {
  chunk_id: string;
  content_ltks?: string;
  content_with_weight: string;
  doc_id: string;
  doc_type_kwd?: string;
  docnm_kwd: string;
  image_id?: string;
  important_kwd?: string[];
  kb_id?: string;
  mom_id?: string;
  positions?: number[][];
  row_id?: string | null;
  similarity: number;
  tag_kwd?: string[];
  term_similarity?: number;
  vector_similarity?: number;
}

export interface DocAgg {
  count: number;
  doc_id: string;
  doc_name: string;
}

export interface SearchExecuteResponseData {
  chunks: SearchChunk[];
  doc_aggs: DocAgg[];
  labels: any | null;
  total: number;
}