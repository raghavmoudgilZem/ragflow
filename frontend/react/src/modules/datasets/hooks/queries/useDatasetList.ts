/**
 * @author Shruthi
 * @description React Query hook — fetch paginated, filtered dataset list.
 *
 *              Unwrap chain:
 *              res              → AxiosResponse
 *              res.data         → ApiResponse<IDatasetListData>
 *              res.data.data    → IDatasetListData { list, total, current_page, page_size }
 */

import { useQuery } from '@tanstack/react-query';
import { DatasetKeys } from '../../utils/datasetKeys';
import { datasetApi } from '../../api/datasetService';
import { adaptDatasetListResponse } from '../../utils/dataset.adapter';
import type { IDatasetListFilters, IDatasetListResponse } from '../../types/dataset.types';

export const useDatasetList = (filters: IDatasetListFilters) =>
    useQuery<IDatasetListResponse>({
        queryKey: DatasetKeys.list(filters),
        queryFn:  async (): Promise<IDatasetListResponse> => {
            const res = await datasetApi.list(filters);
            return adaptDatasetListResponse(res.data.data);
        },
        placeholderData: (prev) => prev, // keeps stale data visible during page transitions
    });