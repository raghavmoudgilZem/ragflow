// useDatasetOwners.spec.tsx

import type { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useDatasetOwners } from './useDatasetOwners';
import { datasetApi } from '../../api/datasetService';
import type { IDatasetOwner } from '../../types/dataset.types';
import { DatasetKeys } from '../../utils/datasetKeys';

vi.mock('../../api/datasetService', () => ({
  datasetApi: {
    listOwners: vi.fn(),
  },
}));

describe('useDatasetOwners', () => {
  let queryClient: QueryClient;

  const createWrapper = () => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    return ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch and return dataset owners', async () => {
    const owners: IDatasetOwner[] = [
      {
        email: 'shruthi.da@zemosolabs.com',
        count: 5,
      },
      {
        email: 'john.doe@zemosolabs.com',
        count: 2,
      },
    ];

    vi.mocked(datasetApi.listOwners).mockResolvedValue(owners);

    const { result } = renderHook(() => useDatasetOwners(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(datasetApi.listOwners).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(owners);
  });

  it('should expose error state when fetching owners fails', async () => {
    const error = new Error('Failed to fetch owners');

    vi.mocked(datasetApi.listOwners).mockRejectedValue(error);

    const { result } = renderHook(() => useDatasetOwners(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(datasetApi.listOwners).toHaveBeenCalledTimes(1);
    expect(result.current.error).toEqual(error);
  });

  it('should use the expected query key', async () => {
    vi.mocked(datasetApi.listOwners).mockResolvedValue([]);

    renderHook(() => useDatasetOwners(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(datasetApi.listOwners).toHaveBeenCalled();
    });

    const query = queryClient.getQueryCache().find({
      queryKey: DatasetKeys.owners(),
    });

    expect(query?.queryKey).toEqual(['datasets', 'owners']);
  });
});