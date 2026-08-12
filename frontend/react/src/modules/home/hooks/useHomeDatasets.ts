import { useQuery } from '@tanstack/react-query';
import { datasetHomeApi } from '../api/datasetHomeApi';
import type { HomeDataset } from '../types/home.types';

const PARAMS = { page: 1, page_size: 6 } as const;

export const useHomeDatasets = () =>
  useQuery<HomeDataset[]>({
    queryKey: ['home', 'datasets', PARAMS],
    queryFn: async () => {
      const res = await datasetHomeApi.list(PARAMS);
      return res.data.data.kbs;
    },
  });
