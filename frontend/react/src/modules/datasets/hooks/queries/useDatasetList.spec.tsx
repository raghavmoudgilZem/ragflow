import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useQuery } from '@tanstack/react-query';

import { useDatasetList } from './useDatasetList';
import { datasetApi } from '../../api/datasetService';
import { DatasetKeys } from '../../utils/datasetKeys';
import { adaptDatasetListResponse } from '../../utils/dataset.adapter';

import type {
  IDatasetListFilters,
  IDatasetListResponse,
} from '../../types/dataset.types';

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
}));

vi.mock('../../api/datasetService', () => ({
  datasetApi: {
    list: vi.fn(),
  },
}));

vi.mock('../../utils/datasetKeys', () => ({
  DatasetKeys: {
    list: vi.fn(),
  },
}));

vi.mock('../../utils/dataset.adapter', () => ({
  adaptDatasetListResponse: vi.fn(),
}));

describe('useDatasetList', () => {
  const filters: IDatasetListFilters = {
    search: 'react',
    page: 2,
    pageSize: 20,
    owners: ['owner-1'],
  };

  const adaptedResponse: IDatasetListResponse = {
    list: [],
    total: 0,
    current_page: 2,
    page_size: 20,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(DatasetKeys.list).mockReturnValue([
      'datasets',
      'list',
      filters,
    ]);

    vi.mocked(useQuery).mockReturnValue({
      data: adaptedResponse,
      isLoading: false,
      isError: false,
    } as never);
  });

  it('should build query using dataset filters', () => {
    renderHook(() => useDatasetList(filters));

    expect(DatasetKeys.list).toHaveBeenCalledWith(filters);

    expect(useQuery).toHaveBeenCalledOnce();
  });

  it('should configure React Query correctly', () => {
    renderHook(() => useDatasetList(filters));

    const options = vi.mocked(useQuery).mock.calls[0][0];

    expect(options.queryKey).toEqual([
      'datasets',
      'list',
      filters,
    ]);

    expect(typeof options.queryFn).toBe('function');

    expect(options.placeholderData).toBeDefined();
  });

  it('should keep previous data as placeholder', () => {
    renderHook(() => useDatasetList(filters));
    const options = vi.mocked(useQuery).mock.calls[0][0];

    expect(typeof options.placeholderData).toBe('function');

    const previous: IDatasetListResponse = {
      list: [],
      total: 0,
      current_page: 2,
      page_size: 20,
    };

    const placeholderData =
      options.placeholderData as (
        previous: IDatasetListResponse | undefined,
      ) => IDatasetListResponse | undefined;

    expect(
      placeholderData(previous),
    ).toBe(previous);
  });

  it('should fetch datasets and adapt the response', async () => {
    const apiResponse = {
      data: {
        success: true,
        status_code: 200,
        errors: [],
        data: {
          list: [],
          total: 0,
          current_page: 2,
          page_size: 20,
        },
      },
    };

    vi.mocked(datasetApi.list).mockResolvedValue(
      apiResponse as never,
    );

    vi.mocked(adaptDatasetListResponse).mockReturnValue(
      adaptedResponse,
    );

    renderHook(() => useDatasetList(filters));

    const options = vi.mocked(useQuery).mock.calls[0][0];

    const queryFn = options.queryFn as () => Promise<IDatasetListResponse>;

    const result = await queryFn();

    expect(datasetApi.list).toHaveBeenCalledWith(filters);

    expect(adaptDatasetListResponse).toHaveBeenCalledWith(
      apiResponse.data.data,
    );

    expect(result).toEqual(adaptedResponse);
  });

  it('should propagate API errors', async () => {
    const error = new Error('API Error');

    vi.mocked(datasetApi.list).mockRejectedValue(error);

    renderHook(() => useDatasetList(filters));

    const options = vi.mocked(useQuery).mock.calls[0][0];


    expect(options.queryFn).toBeDefined();

    const queryFn =
      options.queryFn as () => Promise<IDatasetListResponse>;

    await expect(
      queryFn(),
    ).rejects.toThrow('API Error');

    expect(adaptDatasetListResponse).not.toHaveBeenCalled();
  });

  it('should return loading state', () => {
    vi.mocked(useQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as never);

    const { result } = renderHook(() =>
      useDatasetList(filters),
    );

    expect(result.current.isLoading).toBe(true);

    expect(result.current.data).toBeUndefined();
  });

  it('should return error state', () => {
    vi.mocked(useQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Request failed'),
    } as never);

    const { result } = renderHook(() =>
      useDatasetList(filters),
    );

    expect(result.current.isError).toBe(true);
  });
});