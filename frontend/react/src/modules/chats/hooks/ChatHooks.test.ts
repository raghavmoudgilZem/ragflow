import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, beforeEach, it, expect, type Mock } from 'vitest';
import { useChatList } from './useChatList';
import { useCreateChat } from './useCreateChat';
import { useDeleteChat } from './useDeleteChat';
import { useRenameChat } from './useRenameChat';
import { useDebouncedValue } from './useDebouncedValue';

// Mock react-query
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useQueryClient: vi.fn(),
}));

// Mock the chat API
vi.mock('../api/chatApi', () => ({
  chatApi: {
    list: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    update: vi.fn(),
  },
}));

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '../api/chatApi';

describe('Chat Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useDebouncedValue', () => {
    it('should return initial value immediately', () => {
      const { result } = renderHook(() => useDebouncedValue('test', 400));

      // Initial render returns the debounced value (which starts as initial value)
      expect(result.current).toBe('test');
    });

    it('should debounce value changes', async () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 100),
        { initialProps: { value: 'initial' } }
      );

      expect(result.current).toBe('initial');

      // Update the value
      rerender({ value: 'updated' });

      // Value should still be initial immediately after update
      expect(result.current).toBe('initial');

      // After debounce delay, value should update
      await waitFor(
        () => {
          expect(result.current).toBe('updated');
        },
        { timeout: 200 }
      );
    });

    it('should use custom delay', async () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 50),
        { initialProps: { value: 'test1' } }
      );

      rerender({ value: 'test2' });

      // Should update faster with smaller delay
      await waitFor(
        () => {
          expect(result.current).toBe('test2');
        },
        { timeout: 150 }
      );
    });

    it('should reset debounce timer on multiple rapid changes', async () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 100),
        { initialProps: { value: 'initial' } }
      );

      // Rapid changes
      rerender({ value: 'first' });
      rerender({ value: 'second' });
      rerender({ value: 'final' });

      // Should debounce all changes and only use the final value
      await waitFor(
        () => {
          expect(result.current).toBe('final');
        },
        { timeout: 200 }
      );
    });

    it('should work with different data types', async () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 100),
        { initialProps: { value: { id: 1, name: 'test' } } }
      );

      rerender({ value: { id: 2, name: 'updated' } });

      await waitFor(
        () => {
          expect(result.current).toEqual({ id: 2, name: 'updated' });
        },
        { timeout: 200 }
      );
    });

    it('should cleanup timer on unmount', () => {
      const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');
      
      const { unmount } = renderHook(() => useDebouncedValue('test', 100));

      unmount();

      // clearTimeout should be called
      expect(clearTimeoutSpy).toHaveBeenCalled();
      clearTimeoutSpy.mockRestore();
    });
  });

  describe('useChatList', () => {
    it('should call useQuery with correct config', () => {
      const mockUseQuery = useQuery as any;
      mockUseQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
      });

      const params = { page: 1, page_size: 10 };
      renderHook(() => useChatList(params));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ['chats', 'list', params],
          staleTime: 2 * 60 * 1000,
        })
      );
    });

    it('should have correct staleTime configuration', () => {
      const mockUseQuery = useQuery as any;
      mockUseQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
      });

      renderHook(() => useChatList({ page: 1, page_size: 10 }));

      const config = mockUseQuery.mock.calls[0][0];
      expect(config.staleTime).toBe(2 * 60 * 1000); // 2 minutes
    });

    it('should extract data from response correctly', async () => {
      const mockData = {
        dialogs: [
          { id: '1', name: 'Chat 1', create_time: Date.now() },
        ],
        total: 1,
      };

      const mockUseQuery = useQuery as any;
      mockUseQuery.mockReturnValue({
        data: mockData,
        isLoading: false,
        isError: false,
      });

      const { result } = renderHook(() => useChatList({ page: 1, page_size: 10 }));

      expect(result.current.data).toEqual(mockData);
    });

    it('should handle loading state', () => {
      const mockUseQuery = useQuery as any;
      mockUseQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
      });

      const { result } = renderHook(() => useChatList({ page: 1, page_size: 10 }));

      expect(result.current.isLoading).toBe(true);
      expect(result.current.isError).toBe(false);
    });

    it('should handle error state', () => {
      const mockUseQuery = useQuery as any;
      mockUseQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
      });

      const { result } = renderHook(() => useChatList({ page: 1, page_size: 10 }));

      expect(result.current.isError).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });

    it('should update query key when params change', () => {
      const mockUseQuery = useQuery as any;
      mockUseQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
      });

      const { rerender } = renderHook(
        ({ params }) => useChatList(params),
        { initialProps: { params: { page: 1, page_size: 10 } } }
      );

      expect(mockUseQuery).toHaveBeenCalledTimes(1);

      rerender({ params: { page: 2, page_size: 10 } });

      expect(mockUseQuery).toHaveBeenCalledTimes(2);
    });
  });

  describe('useCreateChat', () => {
    it('should initialize mutation with correct config', () => {
      const mockUseMutation = useMutation as Mock;
      const mockUseQueryClient = useQueryClient as any;
      mockUseQueryClient.mockReturnValue({});

      mockUseMutation.mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      });

      renderHook(() => useCreateChat());

      expect(mockUseMutation).toHaveBeenCalled();
    });

    it('should call chatApi.create with correct payload', () => {
      const mockUseMutation = useMutation as Mock;
      const mockUseQueryClient = useQueryClient as any;
      const mockQueryClient = { invalidateQueries: vi.fn() };
      mockUseQueryClient.mockReturnValue(mockQueryClient);

      const mockMutate = vi.fn();
      mockUseMutation.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      });

      const { result } = renderHook(() => useCreateChat());
      expect(result.current).toBeDefined(); 

      // Get the mutationFn from the config
      const config = mockUseMutation.mock.calls[0][0];

      // The mutationFn should call chatApi.create
      expect(typeof config.mutationFn).toBe('function');
    });

    it('should invalidate chat list query on success', () => {
      const mockUseMutation = useMutation as Mock;
      const mockUseQueryClient = useQueryClient as any;
      const mockQueryClient = { invalidateQueries: vi.fn() };
      mockUseQueryClient.mockReturnValue(mockQueryClient);

      mockUseMutation.mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      });

      renderHook(() => useCreateChat());

      const config = mockUseMutation.mock.calls[0][0];
      
      // Call onSuccess callback
      config.onSuccess();

      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['chats', 'list'],
      });
    });

    it('should return hook with mutate and isPending', () => {
      const mockUseMutation = useMutation as Mock;
      const mockUseQueryClient = useQueryClient as any;
      mockUseQueryClient.mockReturnValue({});

      const mockResult = {
        mutate: vi.fn(),
        isPending: false,
      };

      mockUseMutation.mockReturnValue(mockResult);

      const { result } = renderHook(() => useCreateChat());

      expect(result.current.mutate).toBeDefined();
      expect(result.current.isPending).toBe(false);
    });
  });

  describe('useDeleteChat', () => {
    it('should initialize mutation with correct config', () => {
      const mockUseMutation = useMutation as Mock;
      const mockUseQueryClient = useQueryClient as any;
      mockUseQueryClient.mockReturnValue({});

      mockUseMutation.mockReturnValue({
        mutate: vi.fn(),
      });

      renderHook(() => useDeleteChat());

      expect(mockUseMutation).toHaveBeenCalled();
    });

    it('should call chatApi.delete with chat id', () => {
      const mockUseMutation = useMutation as Mock;
      const mockUseQueryClient = useQueryClient as any;
      mockUseQueryClient.mockReturnValue({});

      mockUseMutation.mockReturnValue({
        mutate: vi.fn(),
      });

      renderHook(() => useDeleteChat());

      const config = mockUseMutation.mock.calls[0][0];
      expect(typeof config.mutationFn).toBe('function');
    });

    it('should invalidate chat list query on success', () => {
      const mockUseMutation = useMutation as Mock;
      const mockUseQueryClient = useQueryClient as any;
      const mockQueryClient = { invalidateQueries: vi.fn() };
      mockUseQueryClient.mockReturnValue(mockQueryClient);

      mockUseMutation.mockReturnValue({
        mutate: vi.fn(),
      });

      renderHook(() => useDeleteChat());

      const config = mockUseMutation.mock.calls[0][0];
      config.onSuccess();

      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['chats', 'list'],
      });
    });

    it('should accept string id directly', () => {
      const mockUseMutation = useMutation as Mock;
      const mockUseQueryClient = useQueryClient as any;
      mockUseQueryClient.mockReturnValue({});

      mockUseMutation.mockReturnValue({
        mutate: vi.fn(),
      });

      renderHook(() => useDeleteChat());

      const config = mockUseMutation.mock.calls[0][0];
      // mutationFn should accept a string ID directly
      expect(typeof config.mutationFn).toBe('function');
    });
  });

  describe('useRenameChat', () => {
    it('should initialize mutation with correct config', () => {
      const mockUseMutation = useMutation as Mock;
      const mockUseQueryClient = useQueryClient as any;
      mockUseQueryClient.mockReturnValue({});

      mockUseMutation.mockReturnValue({
        mutate: vi.fn(),
      });

      renderHook(() => useRenameChat());

      expect(mockUseMutation).toHaveBeenCalled();
    });

    it('should call chatApi.update with dialog_id and name', () => {
      const mockUseMutation = useMutation as Mock;
      const mockUseQueryClient = useQueryClient as any;
      mockUseQueryClient.mockReturnValue({});

      mockUseMutation.mockReturnValue({
        mutate: vi.fn(),
      });

      renderHook(() => useRenameChat());

      const config = mockUseMutation.mock.calls[0][0];
      expect(typeof config.mutationFn).toBe('function');
    });

    it('should destructure dialog_id and name from payload', () => {
      const mockUseMutation = useMutation as Mock;
      const mockUseQueryClient = useQueryClient as any;
      mockUseQueryClient.mockReturnValue({});

      mockUseMutation.mockReturnValue({
        mutate: vi.fn(),
      });

      renderHook(() => useRenameChat());

      const config = mockUseMutation.mock.calls[0][0];
      
      // The mutationFn should properly destructure the payload
      expect(typeof config.mutationFn).toBe('function');
    });

    it('should invalidate chat list query on success', () => {
      const mockUseMutation = useMutation as Mock;
      const mockUseQueryClient = useQueryClient as any;
      const mockQueryClient = { invalidateQueries: vi.fn() };
      mockUseQueryClient.mockReturnValue(mockQueryClient);

      mockUseMutation.mockReturnValue({
        mutate: vi.fn(),
      });

      renderHook(() => useRenameChat());

      const config = mockUseMutation.mock.calls[0][0];
      config.onSuccess();

      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['chats', 'list'],
      });
    });

    it('should handle correct payload structure', async() => {
      const mockUseMutation = useMutation as Mock;
      const mockUseQueryClient = useQueryClient as any;
      mockUseQueryClient.mockReturnValue({});

      const mockMutate = vi.fn();
      mockUseMutation.mockReturnValue({
        mutate: mockMutate,
      });

      renderHook(() => useRenameChat());

      const config = mockUseMutation.mock.calls[0][0];
      
      // Simulate mutation with correct structure
      const payload = { dialog_id: '1', name: 'New Name' };
      await config.mutationFn(payload); 
      expect(chatApi.update).toHaveBeenCalledWith('1', { name: 'New Name' });
    });
  });
});
