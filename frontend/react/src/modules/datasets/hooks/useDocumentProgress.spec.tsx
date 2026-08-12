import type { ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { dataflowKeys } from '../api/dataflowKeys';
import { documentService } from '../services/documentService';
import { IngestionStatus } from '../types/ingestion.types';
import type {
  DocumentProgressListParams,
  DocumentProgressListResponse,
} from '../types/ingestion.types';
import {
  POLL_INTERVAL_BASE,
  POLL_INTERVAL_SUSTAINED,
  POLL_BACKOFF_SUSTAINED_AFTER,
} from '../utils/pollingInterval';
import { useDocumentProgress } from './useDocumentProgress';

vi.mock('../services/documentService', () => ({
  documentService: { listWithProgress: vi.fn() },
}));

const datasetId = 'kb-1';
const params: DocumentProgressListParams = { page: 1, pageSize: 10 };

const response: DocumentProgressListResponse = {
  total: 1,
  docs: [
    {
      id: 'doc-1',
      name: 'invoice.pdf',
      run: IngestionStatus.Running,
      progress: 0.42,
      progress_msg: 'Parsing',
      chunk_num: 3,
      token_num: 120,
      process_duration: 4.2,
    },
  ],
};

let queryClient: QueryClient;

const renderDocumentProgress = (id: string | undefined) => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return renderHook(() => useDocumentProgress(id, params), { wrapper });
};

beforeEach(() => {
  vi.clearAllMocks();
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
});

describe('useDocumentProgress', () => {
  it('requests the document list for the dataset and returns it', async () => {
    vi.mocked(documentService.listWithProgress).mockResolvedValue(response);

    const { result } = renderDocumentProgress(datasetId);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(response);
    expect(documentService.listWithProgress).toHaveBeenCalledWith(
      datasetId,
      params,
    );
  });

  it('caches under the progress list key so progress invalidation reaches it', async () => {
    vi.mocked(documentService.listWithProgress).mockResolvedValue(response);

    const { result } = renderDocumentProgress(datasetId);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(
      queryClient.getQueryData(dataflowKeys.progressList(datasetId, params)),
    ).toEqual(response);
  });

  it('does not fire a request without a dataset id', () => {
    renderDocumentProgress(undefined);

    expect(documentService.listWithProgress).not.toHaveBeenCalled();
  });

  it('surfaces a failure from the service', async () => {
    vi.mocked(documentService.listWithProgress).mockRejectedValue(
      new Error('Ingestion service unavailable'),
    );

    const { result } = renderDocumentProgress(datasetId);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(
      new Error('Ingestion service unavailable'),
    );
  });
});

const responseWith = (run: IngestionStatus): DocumentProgressListResponse => ({
  total: 1,
  docs: [{ ...response.docs[0], run }],
});

const setVisibilityState = (state: DocumentVisibilityState) => {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => state,
  });
};

const emitVisibilityChange = async (state: DocumentVisibilityState) => {
  await act(async () => {
    setVisibilityState(state);
    document.dispatchEvent(new Event('visibilitychange'));
  });
};

const advanceBy = async (milliseconds: number) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(milliseconds);
  });
};

const callCount = () =>
  vi.mocked(documentService.listWithProgress).mock.calls.length;

describe('useDocumentProgress polling', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    setVisibilityState('visible');
  });

  it('keeps refetching while a document is still parsing', async () => {
    vi.mocked(documentService.listWithProgress).mockResolvedValue(
      responseWith(IngestionStatus.Running),
    );

    renderDocumentProgress(datasetId);
    await advanceBy(0);
    expect(callCount()).toBe(1);

    await advanceBy(POLL_INTERVAL_BASE);
    expect(callCount()).toBe(2);

    await advanceBy(POLL_INTERVAL_BASE);
    expect(callCount()).toBe(3);
  });

  it('stops once every document reaches a terminal state', async () => {
    vi.mocked(documentService.listWithProgress)
      .mockResolvedValueOnce(responseWith(IngestionStatus.Running))
      .mockResolvedValue(responseWith(IngestionStatus.Done));

    renderDocumentProgress(datasetId);
    await advanceBy(0);

    await advanceBy(POLL_INTERVAL_BASE);
    expect(callCount()).toBe(2);

    await advanceBy(POLL_INTERVAL_BASE * 4);
    expect(callCount()).toBe(2);
  });

  it('does not poll for documents that are queued but not advancing', async () => {
    vi.mocked(documentService.listWithProgress).mockResolvedValue({
      total: 2,
      docs: [
        { ...response.docs[0], id: 'doc-1', run: IngestionStatus.Unstart },
        { ...response.docs[0], id: 'doc-2', run: IngestionStatus.Schedule },
      ],
    });

    renderDocumentProgress(datasetId);
    await advanceBy(0);

    await advanceBy(POLL_INTERVAL_BASE * 4);
    expect(callCount()).toBe(1);
  });

  it('pauses while the tab is hidden and resumes when it comes back', async () => {
    vi.mocked(documentService.listWithProgress).mockResolvedValue(
      responseWith(IngestionStatus.Running),
    );

    renderDocumentProgress(datasetId);
    await advanceBy(0);
    expect(callCount()).toBe(1);

    await emitVisibilityChange('hidden');
    await advanceBy(POLL_INTERVAL_BASE * 4);
    expect(callCount()).toBe(1);

    await emitVisibilityChange('visible');
    await advanceBy(POLL_INTERVAL_BASE);
    expect(callCount()).toBe(2);
  });

  it('widens the interval once the run has been going a long time', async () => {
    vi.mocked(documentService.listWithProgress).mockResolvedValue(
      responseWith(IngestionStatus.Running),
    );

    renderDocumentProgress(datasetId);
    await advanceBy(0);

    const pollsUntilBackoff = POLL_BACKOFF_SUSTAINED_AFTER / POLL_INTERVAL_BASE;

    for (let poll = 0; poll < pollsUntilBackoff; poll += 1) {
      await advanceBy(POLL_INTERVAL_BASE);
    }

    const sustainedCallCount = callCount();

    await advanceBy(POLL_INTERVAL_BASE);
    expect(callCount()).toBe(sustainedCallCount);

    await advanceBy(POLL_INTERVAL_SUSTAINED - POLL_INTERVAL_BASE);
    expect(callCount()).toBe(sustainedCallCount + 1);
  });

  it('stops polling once the consumer unmounts', async () => {
    vi.mocked(documentService.listWithProgress).mockResolvedValue(
      responseWith(IngestionStatus.Running),
    );

    const { unmount } = renderDocumentProgress(datasetId);
    await advanceBy(0);
    expect(callCount()).toBe(1);

    unmount();
    await advanceBy(POLL_INTERVAL_BASE * 4);

    expect(callCount()).toBe(1);
  });
});
