import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useQueryClient: vi.fn(),
  keepPreviousData: {},
}));

vi.mock('../api/chunkApi', () => ({
  chunkApi: {
    getChunks: vi.fn(),
    createChunk: vi.fn(),
    patchChunk: vi.fn(),
    bulkEnableChunks: vi.fn(),
    bulkDisableChunks: vi.fn(),
    bulkDeleteChunks: vi.fn(),
  },
}));

vi.mock('../api/documentApi', () => ({
  documentApi: {
    getDocument: vi.fn(),
  },
}));

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chunkApi } from '../api/chunkApi';
import { documentApi } from '../api/documentApi';
import { useChunks } from './useChunks';
import { useDocumentDetail } from './useDocumentDetail';
import { useToggleChunkEnabled } from './useToggleChunkEnabled';
import { useBulkToggleChunksEnabled } from './useBulkToggleChunksEnabled';
import { useBulkDeleteChunks } from './useBulkDeleteChunks';
import { useCreateChunk } from './useCreateChunk';

describe('chunk hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useDocumentDetail uses empty queryKey when documentId is missing', () => {
    (useQuery as Mock).mockReturnValue({} as never);
    useDocumentDetail(undefined);
    expect((useQuery as Mock).mock.calls[0]?.[0]?.queryKey).toEqual([]);
  });

  it('useChunks queryFn unwraps envelope', async () => {
    (useQuery as Mock).mockReturnValue({} as never);
    (chunkApi.getChunks as Mock).mockResolvedValue({
      data: {
        success: true,
        statusCode: 200,
        errors: [],
        data: {
          items: [],
          totalItems: 0,
          totalPages: 1,
          currentPage: 1,
          pageSize: 50,
        },
      },
    });

    useChunks(
      {
        documentId: 'doc',
        page: 1,
        pageSize: 50,
        search: '',
      },
      true,
    );

    const queryFn = (useQuery as Mock).mock.calls[0]?.[0]?.queryFn as () => Promise<unknown>;
    const select = (useQuery as Mock).mock.calls[0]?.[0]?.select as (value: unknown) => unknown;
    const response = await queryFn();
    const data = select(response);
    expect(data).toEqual({
      items: [],
      totalItems: 0,
      totalPages: 1,
      currentPage: 1,
      pageSize: 50,
    });
  });

  it('useToggleChunkEnabled mutationFn unwraps and invalidates', async () => {
    const invalidateQueries = vi.fn();
    (useQueryClient as Mock).mockReturnValue({ invalidateQueries });
    (useMutation as Mock).mockReturnValue({} as never);
    (chunkApi.patchChunk as Mock).mockResolvedValue({
      data: {
        success: true,
        statusCode: 200,
        errors: [],
        data: { id: 'c1', enabled: true },
      },
    });

    useToggleChunkEnabled();

    const config = (useMutation as Mock).mock.calls[0]?.[0] as {
      mutationFn: (vars: { chunkId: string; enabled: boolean }) => Promise<unknown>;
      onSuccess: () => void;
    };

    const res = await config.mutationFn({ chunkId: 'c1', enabled: true });
    expect(res).toEqual({ id: 'c1', enabled: true });
    expect(chunkApi.patchChunk).toHaveBeenCalledWith('c1', { enabled: true });

    config.onSuccess();
    expect(invalidateQueries).toHaveBeenCalledTimes(1);
  });

  it('useBulkToggleChunksEnabled calls bulk api and forwards onSuccess', async () => {
    const invalidateQueries = vi.fn();
    const externalOnSuccess = vi.fn();
    (useQueryClient as Mock).mockReturnValue({ invalidateQueries });
    (useMutation as Mock).mockReturnValue({} as never);
    (chunkApi.bulkEnableChunks as Mock).mockResolvedValue({
      data: {
        success: true,
        statusCode: 200,
        errors: [],
        data: { updated: 2 },
      },
    });

    useBulkToggleChunksEnabled({ onSuccess: externalOnSuccess });

    const config = (useMutation as Mock).mock.calls[0]?.[0] as {
      mutationFn: (vars: { chunkIds: string[]; enabled: boolean }) => Promise<unknown>;
      onSuccess: (...args: unknown[]) => void;
    };

    const res = await config.mutationFn({ chunkIds: ['a', 'b'], enabled: true });
    expect(res).toEqual({ updated: 2 });
    expect(chunkApi.bulkEnableChunks).toHaveBeenCalledWith(['a', 'b']);

    config.onSuccess('data');
    expect(invalidateQueries).toHaveBeenCalledTimes(1);
    expect(externalOnSuccess).toHaveBeenCalledTimes(1);
  });

  it('useBulkToggleChunksEnabled uses disable endpoint when enabled is false', async () => {
    (useQueryClient as Mock).mockReturnValue({ invalidateQueries: vi.fn() });
    (useMutation as Mock).mockReturnValue({} as never);
    (chunkApi.bulkDisableChunks as Mock).mockResolvedValue({
      data: {
        success: true,
        statusCode: 200,
        errors: [],
        data: { updated: 2 },
      },
    });

    useBulkToggleChunksEnabled();

    const config = (useMutation as Mock).mock.calls[0]?.[0] as {
      mutationFn: (vars: { chunkIds: string[]; enabled: boolean }) => Promise<unknown>;
    };

    await config.mutationFn({ chunkIds: ['a', 'b'], enabled: false });
    expect(chunkApi.bulkDisableChunks).toHaveBeenCalledWith(['a', 'b']);
  });

  it('useDocumentDetail select unwraps envelope', async () => {
    (useQuery as Mock).mockReturnValue({} as never);
    (documentApi.getDocument as Mock).mockResolvedValue({
      data: {
        success: true,
        statusCode: 200,
        errors: [],
        data: {
          id: 'doc-1',
          datasetId: 'dataset-1',
          datasetName: 'Dataset',
          name: 'Document',
          sizeLabel: '1 KB',
          sizeInBytes: 1024,
          uploadedAt: '2026-07-24T00:00:00Z',
          chunkCount: 1,
          previewTitle: 'Preview',
          previewSubtitle: 'Subtitle',
        },
      },
    });

    useDocumentDetail('doc-1');

    const queryFn = (useQuery as Mock).mock.calls[0]?.[0]?.queryFn as () => Promise<unknown>;
    const select = (useQuery as Mock).mock.calls[0]?.[0]?.select as (value: unknown) => unknown;
    const response = await queryFn();
    const data = select(response);

    expect(documentApi.getDocument).toHaveBeenCalledWith('doc-1');
    expect(data).toMatchObject({
      id: 'doc-1',
      datasetId: 'dataset-1',
      name: 'Document',
    });
  });

  it('useBulkDeleteChunks calls bulk delete api and forwards onSuccess', async () => {
    const invalidateQueries = vi.fn();
    const externalOnSuccess = vi.fn();
    (useQueryClient as Mock).mockReturnValue({ invalidateQueries });
    (useMutation as Mock).mockReturnValue({} as never);
    (chunkApi.bulkDeleteChunks as Mock).mockResolvedValue({
      data: {
        success: true,
        statusCode: 200,
        errors: [],
        data: { deleted: 3 },
      },
    });

    useBulkDeleteChunks({ onSuccess: externalOnSuccess });

    const config = (useMutation as Mock).mock.calls[0]?.[0] as {
      mutationFn: (vars: { chunkIds: string[] }) => Promise<unknown>;
      onSuccess: (...args: unknown[]) => void;
    };

    const res = await config.mutationFn({ chunkIds: ['a', 'b', 'c'] });
    expect(res).toEqual({ deleted: 3 });

    config.onSuccess('data');
    expect(invalidateQueries).toHaveBeenCalledTimes(1);
    expect(externalOnSuccess).toHaveBeenCalledTimes(1);
  });

  it('useCreateChunk calls create api and forwards onSuccess', async () => {
    const invalidateQueries = vi.fn();
    const externalOnSuccess = vi.fn();
    (useQueryClient as Mock).mockReturnValue({ invalidateQueries });
    (useMutation as Mock).mockReturnValue({} as never);
    (chunkApi.createChunk as Mock).mockResolvedValue({
      data: {
        success: true,
        statusCode: 201,
        errors: [],
        data: {
          id: 'new-chunk-1',
          documentId: 'doc-1',
          content: 'New chunk content',
          enabled: true,
          metadata: { page: 1 },
        },
      },
    });

    useCreateChunk({ onSuccess: externalOnSuccess });

    const config = (useMutation as Mock).mock.calls[0]?.[0] as {
      mutationFn: (vars: { documentId: string; content: string }) => Promise<unknown>;
      onSuccess: (...args: unknown[]) => void;
    };

    const payload = {
      documentId: 'doc-1',
      content: 'New chunk content',
      metadata: { page: 1 },
    };
    const res = await config.mutationFn(payload);
    expect(res).toEqual({
      id: 'new-chunk-1',
      documentId: 'doc-1',
      content: 'New chunk content',
      enabled: true,
      metadata: { page: 1 },
    });
    expect(chunkApi.createChunk).toHaveBeenCalledWith(payload);

    config.onSuccess('data');
    expect(invalidateQueries).toHaveBeenCalledTimes(1);
    expect(externalOnSuccess).toHaveBeenCalledTimes(1);
  });
});
