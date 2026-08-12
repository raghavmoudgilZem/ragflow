import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { useDatasetCatalog } from './useDatasetCatalog';
import { useDatasetUiStore } from '../store/useDatasetUiStore';
import { useDatasetList } from './queries/useDatasetList';
import { useCreateDataset } from './queries/useCreateDataset';
import { useUpdateDataset } from './queries/useUpdateDataset';
import { useDeleteDataset } from './queries/useDeleteDataset';

import type {
  IDataset,
  IDatasetListResponse,
} from '../types/dataset.types';

vi.mock('../store/useDatasetUiStore');
vi.mock('./queries/useDatasetList');
vi.mock('./queries/useCreateDataset');
vi.mock('./queries/useUpdateDataset');
vi.mock('./queries/useDeleteDataset');

const catalogProps = {
  search: 'react',
};

const createDataset = (
  overrides: Partial<IDataset> = {},
): IDataset => ({
  id: 'dataset-1',
  name: 'Dataset One',
  description: 'Description',
  embedding_model: 'nomic-embed-text',
  parser_type: 'qa',
  permission: 'me',
  file_count: 5,
  tenant_id: 'tenant-1',
  owner_name: 'john@test.com',
  owner_avatar_url: null,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-02T00:00:00.000Z',
  ...overrides,
});

describe('useDatasetCatalog', () => {
  const mockRefetch = vi.fn();

  const createMutateAsync = vi.fn();
  const updateMutateAsync = vi.fn();
  const deleteMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useDatasetUiStore).mockImplementation((selector) =>
      selector({
        page: 2,
        pageSize: 20,
        ownerFilter: ['owner-1'],
      } as never),
    );

    vi.mocked(useDatasetList).mockReturnValue({
      data: {
        list: [createDataset()],
        total: 1,
        current_page: 2,
        page_size: 20,
      } as IDatasetListResponse,
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    } as never);

    vi.mocked(useCreateDataset).mockReturnValue({
      mutateAsync: createMutateAsync,
      isPending: false,
    } as never);

    vi.mocked(useUpdateDataset).mockReturnValue({
      mutateAsync: updateMutateAsync,
      isPending: false,
    } as never);

    vi.mocked(useDeleteDataset).mockReturnValue({
      mutateAsync: deleteMutateAsync,
      isPending: false,
    } as never);
  });

  it('should pass filters to useDatasetList', () => {
    renderHook(() => useDatasetCatalog(catalogProps));

    expect(useDatasetList).toHaveBeenCalledWith({
      search: 'react',
      page: 2,
      pageSize: 20,
      owners: ['owner-1'],
    });
  });

  it('should expose datasets', () => {
    const { result } = renderHook(() =>
      useDatasetCatalog(catalogProps),
    );

    expect(result.current.datasets).toEqual([
      createDataset(),
    ]);
  });

  it('should expose total', () => {
    const { result } = renderHook(() =>
      useDatasetCatalog(catalogProps),
    );

    expect(result.current.total).toBe(1);
  });

  it('should expose loading state', () => {
    vi.mocked(useDatasetList).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: mockRefetch,
    } as never);

    const { result } = renderHook(() =>
      useDatasetCatalog(catalogProps),
    );

    expect(result.current.isLoading).toBe(true);
  });

  it('should expose error state', () => {
    vi.mocked(useDatasetList).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
    } as never);

    const { result } = renderHook(() =>
      useDatasetCatalog(catalogProps),
    );

    expect(result.current.isError).toBe(true);
  });

  it('should return empty datasets when query data is undefined', () => {
    vi.mocked(useDatasetList).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    } as never);

    const { result } = renderHook(() =>
      useDatasetCatalog(catalogProps),
    );

    expect(result.current.datasets).toEqual([]);
    expect(result.current.total).toBe(0);
  });

  it('should expose refetch function', () => {
    const { result } = renderHook(() =>
      useDatasetCatalog(catalogProps),
    );

    expect(result.current.refetch).toBe(
      mockRefetch,
    );
  });

  it('should call create mutation', async () => {
    createMutateAsync.mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useDatasetCatalog(catalogProps),
    );

    const payload = {
      name: 'New Dataset',
      embedding_model: 'nomic',
      parser_type: 'qa',
    };

    await act(async () => {
      await result.current.createDataset(
        payload,
      );
    });

    expect(createMutateAsync).toHaveBeenCalledWith(
      payload,
    );
  });
    it('should call update mutation', async () => {
    updateMutateAsync.mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useDatasetCatalog(catalogProps),
    );

    const payload = {
      id: 'dataset-1',
      name: 'Updated Dataset',
    };

    await act(async () => {
      await result.current.updateDataset(payload);
    });

    expect(updateMutateAsync).toHaveBeenCalledWith(
      payload,
    );
  });

  it('should call delete mutation', async () => {
    deleteMutateAsync.mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useDatasetCatalog(catalogProps),
    );

    await act(async () => {
      await result.current.deleteDataset('dataset-1');
    });

    expect(deleteMutateAsync).toHaveBeenCalledWith(
      'dataset-1',
    );
  });

  it('should set isMutating when create mutation is pending', () => {
    vi.mocked(useCreateDataset).mockReturnValue({
      mutateAsync: createMutateAsync,
      isPending: true,
    } as never);

    const { result } = renderHook(() =>
      useDatasetCatalog(catalogProps),
    );

    expect(result.current.isMutating).toBe(true);
  });

  it('should set isMutating when update mutation is pending', () => {
    vi.mocked(useUpdateDataset).mockReturnValue({
      mutateAsync: updateMutateAsync,
      isPending: true,
    } as never);

    const { result } = renderHook(() =>
      useDatasetCatalog(catalogProps),
    );

    expect(result.current.isMutating).toBe(true);
  });

  it('should set isMutating when delete mutation is pending', () => {
    vi.mocked(useDeleteDataset).mockReturnValue({
      mutateAsync: deleteMutateAsync,
      isPending: true,
    } as never);

    const { result } = renderHook(() =>
      useDatasetCatalog(catalogProps),
    );

    expect(result.current.isMutating).toBe(true);
  });

  it('should return false when no mutation is pending', () => {
    const { result } = renderHook(() =>
      useDatasetCatalog(catalogProps),
    );

    expect(result.current.isMutating).toBe(false);
  });

  it('should propagate create mutation errors', async () => {
    const error = new Error('Create failed');

    createMutateAsync.mockRejectedValue(error);

    const { result } = renderHook(() =>
      useDatasetCatalog(catalogProps),
    );

    await expect(
      result.current.createDataset({
        name: 'Dataset',
        embedding_model: 'nomic',
        parser_type: 'qa',
      }),
    ).rejects.toThrow('Create failed');
  });

  it('should propagate update mutation errors', async () => {
    const error = new Error('Update failed');

    updateMutateAsync.mockRejectedValue(error);

    const { result } = renderHook(() =>
      useDatasetCatalog(catalogProps),
    );

    await expect(
      result.current.updateDataset({
        id: 'dataset-1',
        name: 'Updated',
      }),
    ).rejects.toThrow('Update failed');
  });

  it('should propagate delete mutation errors', async () => {
    const error = new Error('Delete failed');

    deleteMutateAsync.mockRejectedValue(error);

    const { result } = renderHook(() =>
      useDatasetCatalog(catalogProps),
    );

    await expect(
      result.current.deleteDataset('dataset-1'),
    ).rejects.toThrow('Delete failed');
  });

  it('should recompute filters when store values change', () => {
    vi.mocked(useDatasetUiStore).mockImplementation((selector) =>
      selector({
        page: 5,
        pageSize: 50,
        ownerFilter: ['owner-2'],
      } as never),
    );

    renderHook(() => useDatasetCatalog({
      search: 'updated',
    }));

    expect(useDatasetList).toHaveBeenCalledWith({
      search: 'updated',
      page: 5,
      pageSize: 50,
      owners: ['owner-2'],
    });
  });

  it('should handle empty owner filter', () => {
    vi.mocked(useDatasetUiStore).mockImplementation((selector) =>
      selector({
        page: 1,
        pageSize: 10,
        ownerFilter: [],
      } as never),
    );

    renderHook(() => useDatasetCatalog({search: '',}));

    expect(useDatasetList).toHaveBeenCalledWith({
      search: '',
      page: 1,
      pageSize: 10,
      owners: [],
    });
  });

  it('should expose latest datasets after query changes', () => {
    vi.mocked(useDatasetList).mockReturnValue({
      data: {
        list: [
          createDataset({
            id: 'dataset-2',
            name: 'Updated Dataset',
          }),
        ],
        total: 1,
        current_page: 1,
        page_size: 10,
      } as IDatasetListResponse,
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    } as never);

    const { result } = renderHook(() =>
      useDatasetCatalog(catalogProps),
    );

    expect(result.current.datasets[0].id).toBe(
      'dataset-2',
    );

    expect(result.current.datasets[0].name).toBe(
      'Updated Dataset',
    );
  });
});