/**
 * @author Shruthi
 * @description Type definitions for Dataset feature.
 *              IDataset matches the flat mock server response shape exactly —
 *              no adapter needed. Field names are UI-friendly and debuggable.
 */

export type DatasetPermission = 'me' | 'team';

// ── Core dataset shape — matches mock server datasets.json ─────────────────
// These field names are what the mock returns and what the UI consumes.
// No snake_case API fields here — debuggable as-is in React DevTools.
export interface IDataset {
  id:               string;
  name:             string;
  description:      string;
  embedding_model:  string;
  parser_type:      string;
  permission:       DatasetPermission;
  file_count:       number;
  tenant_id:        string;
  owner_name:       string;
  owner_avatar_url: string | null;
  created_at:       string;
  updated_at:       string;
}

// ── List filters (what UI sends to the service) ────────────────────────────
export interface IDatasetListFilters {
  search:    string;
  page:      number;
  pageSize:  number;
  owners?:   string[];
}

// ── List response (what service returns to the hook) ──────────────────────
// Matches PaginatedData<IDataset> from envelope.ts
export interface IDatasetListResponse {
  list:         IDataset[];
  total:        number;
  current_page: number;
  page_size:    number;
}

// ── Create payload ─────────────────────────────────────────────────────────
export interface ICreateDatasetPayload {
  name:              string;
  description?:      string;
  embedding_model:   string;
  parser_type:       string;
  chunking_method?:  string;
}

// ── Update payload ─────────────────────────────────────────────────────────
export type IUpdateDatasetPayload = Partial<ICreateDatasetPayload> & { id: string };

// ── Owner (for filter popover) ─────────────────────────────────────────────
export interface IDatasetOwner {
  email: string;
  count: number;
}