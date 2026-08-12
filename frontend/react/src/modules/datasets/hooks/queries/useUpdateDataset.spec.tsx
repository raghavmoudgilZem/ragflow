import type { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useUpdateDataset } from './useUpdateDataset';
import { datasetApi } from '../../api/datasetService';
import { DatasetKeys } from '../../utils/datasetKeys';
import { notifyError } from '@shared/api/notification';

import type { IUpdateDatasetPayload } from '../../types/dataset.types';

vi.mock('../../api/datasetService', () => ({
  datasetApi: {
    update: vi.fn(),
  },
}));

vi.mock('@shared/api/notification', () => ({
  notifyError: vi.fn(),
}));

describe('useUpdateDataset', () => {
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

  it('should update dataset and invalidate dataset lists', async () => {
    const payload: IUpdateDatasetPayload = {
      id: 'dataset-123',
      name: 'Updated Dataset',
    };

    vi.mocked(datasetApi.update).mockResolvedValue({} as never);

    const invalidateQueriesSpy = vi.spyOn(
      queryClient,
      'invalidateQueries',
    );

    const { result } = renderHook(
      () => useUpdateDataset(),
      {
        wrapper,
      },
    );

    await act(async () => {
      await result.current.mutateAsync(payload);
    });

    expect(datasetApi.update).toHaveBeenCalledTimes(1);

    expect(
      vi.mocked(datasetApi.update).mock.calls[0][0],
    ).toEqual(payload);

    expect(invalidateQueriesSpy).toHaveBeenCalledTimes(1);

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: DatasetKeys.lists(),
    });

    expect(notifyError).not.toHaveBeenCalled();
  });

  it('should show notification when update fails', async () => {
    const payload: IUpdateDatasetPayload = {
      id: 'dataset-123',
      name: 'Updated Dataset',
    };

    const error = new Error('Update failed');

    vi.mocked(datasetApi.update).mockRejectedValue(error);

    const invalidateQueriesSpy = vi.spyOn(
      queryClient,
      'invalidateQueries',
    );

    const { result } = renderHook(
      () => useUpdateDataset(),
      {
        wrapper,
      },
    );

    await expect(
      result.current.mutateAsync(payload),
    ).rejects.toThrow('Update failed');

    expect(
      vi.mocked(datasetApi.update).mock.calls[0][0],
    ).toEqual(payload);

    expect(invalidateQueriesSpy).not.toHaveBeenCalled();

    expect(notifyError).toHaveBeenCalledTimes(1);

    expect(notifyError).toHaveBeenCalledWith({
      message: 'Failed to update dataset',
      description: 'Update failed',
    });
  });

  it('should use empty error message when hook receives an empty message', async () => {
    const payload: IUpdateDatasetPayload = {
      id: 'dataset-123',
      name: 'Updated Dataset',
    };

    const error = new Error('');
    error.message = '';

    vi.mocked(datasetApi.update).mockRejectedValue(error);

    const { result } = renderHook(
      () => useUpdateDataset(),
      {
        wrapper,
      },
    );

    await expect(
      result.current.mutateAsync(payload),
    ).rejects.toThrow();

    expect(notifyError).toHaveBeenCalledWith({
      message: 'Failed to update dataset',
      description: '',
    });
  });
});