export interface CreateSearchPayload {
  name: string;
}

export interface SearchConfigResponse {
  id: string;
  name: string;
  createdAt: string;
}

export interface RAGConfig {
  kb_ids: string[];
  threshold: number;
  top_k: number;
  llm_id: string;
  [key: string]: unknown; // Allows unexpected or experimental recipe flags
}

export interface PaginatedSearchResponse {
  items: SearchAppItem[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  [key: string]: unknown; // Safely swallows extra meta arrays returned by the API
}

export interface SearchAppsQueryParams {
  page: number;
  pageSize: number;
  search: string;
}


export interface LlmSetting {
  parameter: string;
  temperature: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
}

export interface ReferenceMetadata {
  include: boolean;
}

export interface SearchConfig {
  kb_ids: string[];
  web_search: boolean;
  similarity_threshold: number;      // Maps to your similarity slider
  vector_similarity_weight: number;  // Maps to your vector weight slider
  use_kg: boolean;
  top_k: number;
  summary: boolean;                 // Maps to your AI Summary switch
  related_search: boolean;          // Maps to your Related Search switch
  query_mindmap: boolean;           // Maps to your Mindmap switch
  doc_ids: string[];
  chat_id: string;
  highlight: boolean;
  keyword: boolean;
  chat_settingcross_languages: any[];
  reference_metadata: ReferenceMetadata;
  meta_data_filter: Record<string, any>;
  rerank_id: string;                // Maps to your Rerank switch if structured as an ID string
  llm_setting: LlmSetting;
  rerank_model: boolean;
  meta_data: string;
}

// Complete request payload matching your example JSON structure
export interface UpdateConfigPayload {
  search_id: string;
  name: string;
  avatar: string;
  description: string;
  search_config: Partial<SearchConfig>; // Partial allows you to send only modified parameters
  tenant_id: string;
}


// Complete item payload returned inside the backend response wrapper data key
export interface SearchAppItem {
  id: string;
  name: string;
  userId: string;
  avatar?: string;
  create_date?: string;
  create_time?: number;
  created_by?: string;
  description?: string;
  search_config?: SearchConfig;
  status?: string;
  tenant_id?: string;
  update_date?: string;
  update_time?: number;
  chat_id?: string;
  doc_ids?: string[];
  highlight: boolean;
}
