import type { ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { dataflowKeys } from '../api/dataflowKeys';
import { useDataflowInvalidation } from './useDataflowInvalidation';

const datasetId = 'kb-1';
const documentId = 'doc-1';

let queryClient: QueryClient;

const renderInvalidation = () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return renderHook(() => useDataflowInvalidation(), { wrapper });
};

beforeEach(() => {
  queryClient = new QueryClient();
  vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue(undefined);
});

describe('useDataflowInvalidation', () => {
  it('invalidates the shared root', async () => {
    const { result } = renderInvalidation();
    await result.current.all();
    expect(queryClient.invalidateQueries).toHaveBeenCalledTimes(1);
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: dataflowKeys.all,
    });
  });

  it('invalidates the overview key', async () => {
    const { result } = renderInvalidation();
    await result.current.overview(datasetId);
    expect(queryClient.invalidateQueries).toHaveBeenCalledTimes(1);
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: dataflowKeys.overview(datasetId),
    });
  });

  it('invalidates the logs key', async () => {
    const { result } = renderInvalidation();
    await result.current.logs(datasetId);
    expect(queryClient.invalidateQueries).toHaveBeenCalledTimes(1);
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: dataflowKeys.logs(datasetId),
    });
  });

  it('invalidates the progress key', async () => {
    const { result } = renderInvalidation();
    await result.current.progress(datasetId);
    expect(queryClient.invalidateQueries).toHaveBeenCalledTimes(1);
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: dataflowKeys.progress(datasetId),
    });
  });

  it('invalidates the document progress key', async () => {
    const { result } = renderInvalidation();
    await result.current.documentProgress(datasetId, documentId);
    expect(queryClient.invalidateQueries).toHaveBeenCalledTimes(1);
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: dataflowKeys.documentProgress(datasetId, documentId),
    });
  });

  it('invalidates overview and logs on a terminal state', async () => {
    const { result } = renderInvalidation();
    await result.current.onTerminal(datasetId);
    expect(queryClient.invalidateQueries).toHaveBeenCalledTimes(2);
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: dataflowKeys.overview(datasetId),
    });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: dataflowKeys.logs(datasetId),
    });
  });

  it('keeps a stable reference across re-renders', () => {
    const { result, rerender } = renderInvalidation();
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });
});
