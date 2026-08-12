import type { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useCreateDataset } from './useCreateDataset';
import { datasetApi } from '../../api/datasetService';
import { DatasetKeys } from '../../utils/datasetKeys';
import { notifyError } from '@shared/api/notification';

import type { ICreateDatasetPayload } from '../../types/dataset.types';

vi.mock('../../api/datasetService', () => ({
  datasetApi: {
    create: vi.fn(),
  },
}));

vi.mock('@shared/api/notification', () => ({
  notifyError: vi.fn(),
}));

describe('useCreateDataset', () => {
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

  it('should create dataset and invalidate list & owner queries', async () => {
    const payload: ICreateDatasetPayload = {
      name: 'Dataset',
      description: 'Test Dataset',
      embedding_model: 'nomic-embed-text',
      parser_type: 'qa',
      chunking_method: 'manual',
    };

    vi.mocked(datasetApi.create).mockResolvedValue({} as never);

    const invalidateQueriesSpy = vi.spyOn(
      queryClient,
      'invalidateQueries',
    );

    const { result } = renderHook(
      () => useCreateDataset(),
      {
        wrapper,
      },
    );

    await act(async () => {
      await result.current.mutateAsync(payload);
    });

    expect(datasetApi.create).toHaveBeenCalledTimes(1);

    expect(
      vi.mocked(datasetApi.create).mock.calls[0][0],
    ).toEqual(payload);

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

  it('should show notification when create fails', async () => {
    const payload: ICreateDatasetPayload = {
      name: 'Dataset',
      description: 'Test Dataset',
      embedding_model: 'nomic-embed-text',
      parser_type: 'qa',
    };

    const error = new Error('Create failed');

    vi.mocked(datasetApi.create).mockRejectedValue(error);

    const invalidateQueriesSpy = vi.spyOn(
      queryClient,
      'invalidateQueries',
    );

    const { result } = renderHook(
      () => useCreateDataset(),
      {
        wrapper,
      },
    );

    await expect(
      result.current.mutateAsync(payload),
    ).rejects.toThrow('Create failed');

    expect(
      vi.mocked(datasetApi.create).mock.calls[0][0],
    ).toEqual(payload);

    expect(invalidateQueriesSpy).not.toHaveBeenCalled();

    expect(notifyError).toHaveBeenCalledTimes(1);

    expect(notifyError).toHaveBeenCalledWith({
      message: 'Failed to create dataset',
      description: 'Create failed',
    });
  });

  it('should use fallback error message when error.message is empty', async () => {
    const payload: ICreateDatasetPayload = {
      name: 'Dataset',
      embedding_model: 'nomic-embed-text',
      parser_type: 'qa',
    };

    const error = new Error('');
    error.message = '';

    vi.mocked(datasetApi.create).mockRejectedValue(error);

    const { result } = renderHook(
      () => useCreateDataset(),
      {
        wrapper,
      },
    );

    await expect(
      result.current.mutateAsync(payload),
    ).rejects.toThrow();

    expect(notifyError).toHaveBeenCalledWith({
      message: 'Failed to create dataset',
      description:
        'Something went wrong. Please try again.',
    });
  });
});