/**
 * @author Shruthi
 * @description Dataset adapter — maps API response shape to UI types.
 *
 *              MOCK SERVER (current):
 *              Mock returns IDataset directly — field names already match
 *              the UI interface. No transformation needed.
 *              adaptDatasetListResponse is a pass-through.
 *
 *              REAL API (future — knowledge-service):
 *              Real API returns snake_case raw fields (embd_id, doc_num …).
 *              Uncomment adaptKnowledge() below and update
 *              adaptDatasetListResponse to call it per item.
 */

import type { IDatasetListResponse } from '../types/dataset.types';
import type { IDatasetListData } from '../types/dataset.raw.types';

// ── Mock adapter — pass-through (no field mapping needed) ──────────────────
// res.data.data already IS IDatasetListData { list: IDataset[], total, ... }
// This function exists so useDatasetList never needs to change
// when we switch from mock → real API — only this file changes.

export const adaptDatasetListResponse = (
    raw: IDatasetListData,
): IDatasetListResponse => ({
    list:         raw.list,
    total:        raw.total,
    current_page: raw.current_page,
    page_size:    raw.page_size,
});

