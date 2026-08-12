import type { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useDeleteDataset } from './useDeleteDataset';
import { datasetApi } from '../../api/datasetService';
import { DatasetKeys } from '../../utils/datasetKeys';
import { notifyError } from '@shared/api/notification';

vi.mock('../../api/datasetService', () => ({
  datasetApi: {
    remove: vi.fn(),
  },
}));

vi.mock('@shared/api/notification', () => ({
  notifyError: vi.fn(),
}));

describe('useDeleteDataset', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();

    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    });
  });

  const wrapper = ({
    children,
  }: {
    children: ReactNode;
  }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it('should delete dataset and invalidate list & owner queries', async () => {
    const datasetId = 'dataset-123';

    vi.mocked(datasetApi.remove).mockResolvedValue({} as never);

    const invalidateQueriesSpy = vi.spyOn(
      queryClient,
      'invalidateQueries',
    );

    const { result } = renderHook(
      () => useDeleteDataset(),
      {
        wrapper,
      },
    );

    await act(async () => {
      await result.current.mutateAsync(datasetId);
    });

    expect(datasetApi.remove).toHaveBeenCalledTimes(1);

    expect(
      vi.mocked(datasetApi.remove).mock.calls[0][0],
    ).toBe(datasetId);

    expect(invalidateQueriesSpy).toHaveBeenCalledTimes(2);

    expect(invalidateQueriesSpy).toHaveBeenNthCalledWith(
      1,
      {
        queryKey: DatasetKeys.lists(),
      },
    );

    expect(invalidateQueriesSpy).toHaveBeenNthCalledWith(
      2,
      {
        queryKey: DatasetKeys.owners(),
      },
    );

    expect(notifyError).not.toHaveBeenCalled();
  });

  it('should show notification when delete fails', async () => {
    const datasetId = 'dataset-123';

    const error = new Error('Delete failed');

    vi.mocked(datasetApi.remove).mockRejectedValue(error);

    const invalidateQueriesSpy = vi.spyOn(
      queryClient,
      'invalidateQueries',
    );

    const { result } = renderHook(
      () => useDeleteDataset(),
      {
        wrapper,
      },
    );

    await expect(
      result.current.mutateAsync(datasetId),
    ).rejects.toThrow('Delete failed');

    expect(
      vi.mocked(datasetApi.remove).mock.calls[0][0],
    ).toBe(datasetId);

    expect(invalidateQueriesSpy).not.toHaveBeenCalled();

    expect(notifyError).toHaveBeenCalledTimes(1);

    expect(notifyError).toHaveBeenCalledWith({
      message: 'Failed to delete dataset',
      description: 'Delete failed',
    });
  });

  it('should use fallback error message when error message is empty', async () => {
    const datasetId = 'dataset-123';

    const error = new Error('');
    error.message = '';

    vi.mocked(datasetApi.remove).mockRejectedValue(error);

    const { result } = renderHook(
      () => useDeleteDataset(),
      {
        wrapper,
      },
    );

    await expect(
      result.current.mutateAsync(datasetId),
    ).rejects.toThrow();

    expect(notifyError).toHaveBeenCalledWith({
      message: 'Failed to delete dataset',
      description: '',
    });
  });
});