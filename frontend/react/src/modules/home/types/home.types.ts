import type React from 'react';

// ─────────────────────────────────────────
// DATASETS
// ─────────────────────────────────────────

export interface HomeDataset {
  id: string;
  name: string;
  avatar: string | null;
  doc_num: number;
  chunk_num: number;
  update_time: number; // Unix timestamp (ms)
  description: string;
  status: '1' | '0';
  permission: 'me' | 'team';
  language: string;
  embedding_model: string;
}

export interface DatasetListResponse {
  kbs: HomeDataset[];
  total: number;
}

// ─────────────────────────────────────────
// CHATS (Dialogs)
// ─────────────────────────────────────────

export interface HomeChat {
  id: string;
  dialog_id: string;
  name: string;
  icon: string; // emoji or base64 avatar
  description: string;
  update_time: number;
  create_time: number;
  kb_ids: string[];
  llm_id: string;
  status: '1' | '0';
}

export interface ChatListResponse {
  dialogs: HomeChat[];
  total: number;
}

// ─────────────────────────────────────────
// AGENTS (Flows / Canvas)
// ─────────────────────────────────────────

export interface HomeAgent {
  id: string;
  title: string;
  avatar: string | null;
  canvas_type: null;
  canvas_category: string;
  update_time: number;
  create_time: number;
  user_id: string;
  permission: 'me' | 'team';
}

export interface AgentListResponse {
  list: HomeAgent[];
  total: number;
}

// ─────────────────────────────────────────
// SEARCHES
// ─────────────────────────────────────────

export interface HomeSearch {
  id: string;
  name: string;
  avatar: string | null;
  description: string;
  create_time: number;
  update_time: number;
  created_by: string;
  status: string;
  tenant_id: string;
}

export interface SearchListResponse {
  list: HomeSearch[];
  total: number;
}

// ─────────────────────────────────────────
// UI / COMPONENT PROP INTERFACES
// ─────────────────────────────────────────

// Normalised card shape — maps the 3 different entity shapes to one common shape
// so HomeEntryCard can render chats, agents, and searches identically
export interface HomeEntryCardData {
  id: string;
  name: string;
  description?: string | null;
  avatar?: string | null;
  updatedAt: number; // Unix ms — normalised from update_time / create_time
}

export interface HomeEntryCardProps {
  data: HomeEntryCardData;
  icon: React.ReactNode; // fallback icon when avatar is null
  onClick?: () => void;
}

export interface DatasetCardProps {
  data: HomeDataset;
  onClick?: () => void;
}

export interface SectionHeaderProps {
  label: string;
  icon?: React.ReactNode;
  seeAllHref?: string;
}

export interface EmptyStateCardProps {
  label: string;
  onCreateClick?: () => void;
}

// Active tab in the Applications section
export type ApplicationTab = 'chat' | 'search' | 'agent';

// ─────────────────────────────────────────
// MAPPING HELPERS
// Convert raw API shapes → HomeEntryCardData
// ─────────────────────────────────────────

export const chatToCardData = (chat: HomeChat): HomeEntryCardData => ({
  id: chat.id,
  name: chat.name,
  description: chat.description,
  avatar: chat.icon,
  updatedAt: chat.update_time,
});

export const agentToCardData = (agent: HomeAgent): HomeEntryCardData => ({
  id: agent.id,
  name: agent.title,
  description: null,
  avatar: agent.avatar,
  updatedAt: agent.update_time,
});

export const searchToCardData = (search: HomeSearch): HomeEntryCardData => ({
  id: search.id,
  name: search.name,
  description: search.description,
  avatar: search.avatar,
  updatedAt: search.update_time,
});
