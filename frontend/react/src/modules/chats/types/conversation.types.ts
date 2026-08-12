// ─── Domain Entity ────────────────────────────────────────────────────────────

export interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  doc_ids?: string[];
  prompt?: string;
}

export interface ReferenceChunk {
  id: string;
  content: string | null;
  document_id: string;
  document_name: string;
  dataset_id: string;
  image_id: string;
  similarity: number;
  vector_similarity: number;
  term_similarity: number;
  positions: number[];
  doc_type?: string;
}

export interface Docagg {
  count: number;
  doc_id: string;
  doc_name: string;
  url?: string;
}

export interface Reference {
  chunks: ReferenceChunk[];
  doc_aggs: Docagg[];
  total: number;
}

export interface Conversation {
  id: string;
  dialog_id: string;
  name: string;
  avatar: string;
  create_date: string;
  create_time: number;
  created_at: string;
  update_date: string;
  update_time: number;
  is_new: boolean;
  message: Message[];
  reference: Reference[];
}

export interface ConversationListParams {
  dialog_id: string;
  page?: number;
  page_size?: number;
  keywords?: string;
}

export interface ConversationMeta {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_more: boolean;
}

export interface ConversationListResponseData {
  conversations: Conversation[];
  meta: ConversationMeta;
}

export interface CreateConversationPayload {
  dialog_id: string;
  name?: string;
}

export interface SidebarHeaderProps {
  total: number;
  onNewChat: () => void;
}

export interface ConversationListProps {
  dialogId: string;
  onSelect: (id: string) => void;
}

export interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: (id: string) => void;
}

export interface SidebarContentProps {
  chatName: string;
  avatarBg: string;
  total: number;
  onNewChat: () => void;
  onToggle: () => void;
  dialogId: string;
  onSelect: (id: string) => void;
}