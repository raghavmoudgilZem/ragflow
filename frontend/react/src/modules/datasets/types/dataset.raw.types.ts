/**
 * @author Shruthi
 * @description Raw API response types for the dataset feature.
 *
 *              MOCK SERVER (current):
 *              Returns flat ApiResponse<PaginatedData<IDataset>> —
 *              no raw-to-UI mapping needed. This file only re-exports
 *              the mock response shape for typing service calls.
 *
 *              REAL API (future):
 *              When the real knowledge-service is integrated, add the
 *              raw snake_case fields (embd_id, doc_num, parser_id …)
 *              back here and update dataset.adapter.ts to map them.
 */

import type { IDataset } from './dataset.types';

// ── Mock server response shape ─────────────────────────────────────────────
// Matches PaginatedData<IDataset> from envelope.ts exactly.
// res.data      → ApiResponse<IDatasetListData>
// res.data.data → IDatasetListData { list, total, current_page, page_size }
// res.data.data.list  → IDataset[]
// res.data.data.total → number

export interface IDatasetListData {
    list:         IDataset[];
    total:        number;
    current_page: number;
    page_size:    number;
}

