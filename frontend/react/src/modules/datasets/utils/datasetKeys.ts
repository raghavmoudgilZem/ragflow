/**
 * @author Shruthi
 * @description DatasetKeys query factory — single source of truth for all
 *              React Query cache keys in the dataset feature.
 *
 * Hierarchy:
 *   ['datasets']                              ← all()   — wipe everything
 *   ['datasets', 'list']                      ← lists() — wipe all list views
 *   ['datasets', 'list', { ...filters }]      ← list()  — one paginated view
 *   ['datasets', 'detail', id]                ← detail()
 *   ['datasets', 'owners']                    ← owners()
 */
import { type IDatasetListFilters } from '../types/dataset.types';
 
export const DatasetKeys = {
  all: () => ['datasets'] as const,
 
  lists: () => [...DatasetKeys.all(), 'list'] as const,
 
  list: (filters: IDatasetListFilters) =>
    [...DatasetKeys.lists(), filters] as const,
 
  detail: (id: string) =>
    [...DatasetKeys.all(), 'detail', id] as const,
 
  owners: () => [...DatasetKeys.all(), 'owners'] as const,
};