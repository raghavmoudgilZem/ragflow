// ─── Domain Entity ───────────────────────────────────────────────────────────

export interface Variable {
  frequency_penalty?: number;
  max_tokens?: number;
  presence_penalty?: number;
  temperature?: number;
  top_p?: number;
  llm_id?: string;
}

export interface Parameter {
  key: string;
  optional: boolean;
}

export interface PromptConfig {
  empty_response?: string;
  parameters?: Parameter[];
  prologue?: string;
  system_prompt: string;
  tts?: boolean;
  quote?: boolean;
  keyword?: boolean;
  refine_multiturn?: boolean;
  use_kg?: boolean;
  reasoning?: boolean;
  cross_languages?: Array<string>;
}

export interface Chat {
  create_date: string;
  create_time: number;
  description: string;
  icon: string;
  id: string;
  dialog_id: string;
  kb_ids: string[];
  kb_names: string[];
  language: string;
  llm_id: string;
  llm_setting: Variable;
  llm_setting_type: string;
  name: string;
  prompt_config: PromptConfig;
  prompt_type: string;
  status: string;
  tenant_id: string;
  update_date: string;
  update_time: number;
  vector_similarity_weight: number;
  similarity_threshold: number;
  top_k: number;
  top_n: number;
  created_at: string;
}

// ─── API Request / Response ───────────────────────────────────────────────────

export interface ChatListParams {
  page: number;
  page_size: number;
  keywords?: string;
}

export interface ChatListMeta {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_more: boolean;
}

export interface ChatListResponseData {
  dialogs: Chat[];
  meta: ChatListMeta;
}

export interface CreateChatPayload {
  name: string;
  description?: string;
  kb_ids?: string[];
  kb_names?: string[];
  language?: string;
  llm_id?: string;
  prompt_config?: PromptConfig;
  similarity_threshold: number;
  vector_similarity_weight: number;
  top_n: number;
}

export interface RenameChatPayload {
  name?: string;
  description?: string;
  llm_setting?: Partial<Variable>;
  prompt_config?: Partial<PromptConfig>;
}

export interface DeleteChatPayload {
  dialog_ids: string[];
}

// ─── Component Props ──────────────────────────────────────────────────────────

export interface ChatCardProps {
  chat: Chat;
  onClick: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
}

export interface ChatEmptyStateProps {
  onCreateClick: () => void;
}

interface CreateChatModalBaseProps {
  open: boolean;
  onClose: () => void;
}

interface CreateModeProps extends CreateChatModalBaseProps {
  mode: 'create';
  initialName?: never;
  onRename?: never;
}

interface RenameModeProps extends CreateChatModalBaseProps {
  mode: 'rename';
  initialName: string;
  onRename: (
    newName: string,
    callbacks: { onSuccess: () => void; onError: () => void }
  ) => void;
}

export type CreateChatModalProps = CreateModeProps | RenameModeProps;

export interface ChatPaginationProps {
  total: number;
  totalPages: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}
