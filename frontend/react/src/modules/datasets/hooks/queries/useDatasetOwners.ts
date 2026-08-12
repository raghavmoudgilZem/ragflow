/**
 * @author Shruthi
 * @description React Query hook — fetch unique owner list for the filter popover.
 *              Derived from the full kb list since no dedicated owners endpoint exists.
 */

import { useQuery } from '@tanstack/react-query';
import { DatasetKeys } from '../../utils/datasetKeys';
import { datasetApi } from '../../api/datasetService';
import type { IDatasetOwner } from '../../types/dataset.types';

export const useDatasetOwners = () =>
  useQuery<IDatasetOwner[]>({
    queryKey: DatasetKeys.owners(),
    queryFn: (): Promise<IDatasetOwner[]> => datasetApi.listOwners(),
    staleTime: 5 * 60 * 1000, // 5 min — owner list rarely changes mid-session
  });