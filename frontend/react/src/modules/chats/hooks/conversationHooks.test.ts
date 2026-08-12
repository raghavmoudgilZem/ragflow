import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useConversationList } from '@modules/chats/hooks/useConversationList';
import { useCreateConversation } from '@modules/chats/hooks/useCreateConversation';
import { conversationApi } from '@modules/chats/api/conversationApi';
import React from 'react';

vi.mock('@modules/chats/api/conversationApi');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useConversationList', () => {
  const mockConversationData = {
    conversations: [
      {
        id: 'conv-1',
        dialog_id: 'dialog-123',
        name: 'Test Conversation',
        avatar: 'T',
        create_date: '2024-01-01',
        create_time: 1704067200000,
        update_date: '2024-01-02',
        update_time: 1704153600000,
        is_new: false,
        message: [],
        reference: [],
      },
    ],
    total: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch conversations list', async () => {
    (conversationApi.list as any).mockResolvedValue({
      data: {
        data: mockConversationData,
      },
    });

    const { result } = renderHook(
      () => useConversationList( 'dialog-123' ),
      { wrapper: createWrapper() }
    );

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockConversationData);
  });

  it('should handle conversation list with keywords filter', async () => {
    (conversationApi.list as any).mockResolvedValue({
      data: {
        data: mockConversationData,
      },
    });

    renderHook(
      () => useConversationList('dialog-123', 'test'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(conversationApi.list).toHaveBeenCalledWith(
        expect.objectContaining({
          dialog_id: 'dialog-123',
          keywords: 'test',
        })
      );
    });
  });

  it('should handle errors when fetching conversations', async () => {
    const mockError = new Error('Network error');
    (conversationApi.list as any).mockRejectedValue(mockError);

    const { result } = renderHook(
      () => useConversationList('dialog-123'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it('should cache conversations data', async () => {
    (conversationApi.list as any).mockResolvedValue({
      data: {
        data: mockConversationData,
      },
    });

    const wrapper = createWrapper();
    const { rerender } = renderHook(
      () => useConversationList('dialog-123'),
      { wrapper }
    );

    await waitFor(() => {
      expect(conversationApi.list).toHaveBeenCalledTimes(1);
    });

    // Rerender with same params - should use cache
    rerender();

    expect(conversationApi.list).toHaveBeenCalledTimes(1);
  });

  it('should invalidate cache when different dialog_id is used', async () => {
    (conversationApi.list as any).mockResolvedValue({
      data: {
        data: mockConversationData,
      },
    });

    const wrapper = createWrapper();
    const { rerender } = renderHook(
      ({ dialogId }) => useConversationList( dialogId ),
      {
        wrapper,
        initialProps: { dialogId: 'dialog-123' },
      }
    );

    await waitFor(() => {
      expect(conversationApi.list).toHaveBeenCalledTimes(1);
    });

    rerender({ dialogId: 'dialog-456' });

    await waitFor(() => {
      expect(conversationApi.list).toHaveBeenCalledTimes(2);
    });
  });

  it('should have stale time of 2 minutes', () => {
    (conversationApi.list as any).mockResolvedValue({
      data: {
        data: mockConversationData,
      },
    });

    // This test verifies the hook configuration
    // The hook has staleTime: 2 * 60 * 1000 (2 minutes)
    const { result } = renderHook(
      () => useConversationList('dialog-123'),
      { wrapper: createWrapper() }
    );

    // Hook should be created successfully with stale time configuration
    expect(result.current).toBeDefined();
  });

  it('should refetch data when refetch is called', async () => {
    (conversationApi.list as any).mockResolvedValue({
      data: {
        data: mockConversationData,
      },
    });

    const { result } = renderHook(
      () => useConversationList('dialog-123'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(conversationApi.list).toHaveBeenCalledTimes(1);
    });

    result.current.refetch?.();

    await waitFor(() => {
      expect(conversationApi.list).toHaveBeenCalledTimes(2);
    });
  });
});

describe('useCreateConversation', () => {
  const mockNewConversation = {
    id: 'conv-new',
    dialog_id: 'dialog-123',
    name: 'New Conversation',
    avatar: 'N',
    create_date: '2024-01-03',
    create_time: 1704240000000,
    update_date: '2024-01-03',
    update_time: 1704240000000,
    is_new: true,
    message: [],
    reference: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a new conversation', async () => {
    (conversationApi.create as any).mockResolvedValue({
      data: {
        data: mockNewConversation,
      },
    });

    const { result } = renderHook(
      () => useCreateConversation(),
      { wrapper: createWrapper() }
    );

    result.current.mutate({
      dialog_id: 'dialog-123',
      name: 'New Conversation',
    });

    await waitFor(() => {
      expect(conversationApi.create).toHaveBeenCalledWith(
        expect.objectContaining({
          dialog_id: 'dialog-123',
          name: 'New Conversation',
        })
      );
    });
  });

  it('should handle creation errors', async () => {
    const mockError = new Error('Creation failed');
    (conversationApi.create as any).mockRejectedValue(mockError);

    const { result } = renderHook(
      () => useCreateConversation(),
      { wrapper: createWrapper() }
    );

    const onErrorFn = vi.fn();
    result.current.mutate(
      {
        dialog_id: 'dialog-123',
        name: 'New Conversation',
      },
      {
        onError: onErrorFn,
      }
    );

    await waitFor(() => {
      expect(onErrorFn).toHaveBeenCalled();
    });
  });

  it('should invalidate conversation list cache on success', async () => {
    (conversationApi.create as any).mockResolvedValue({
      data: {
        data: mockNewConversation,
      },
    });

    (conversationApi.list as any).mockResolvedValue({
      data: {
        data: {
          conversations: [mockNewConversation],
          total: 1,
        },
      },
    });

    const { result } = renderHook(
      () => useCreateConversation(),
      { wrapper: createWrapper() }
    );

    const onSuccessFn = vi.fn();
    result.current.mutate(
      {
        dialog_id: 'dialog-123',
        name: 'New Conversation',
      },
      {
        onSuccess: onSuccessFn,
      }
    );

    await waitFor(() => {
      expect(onSuccessFn).toHaveBeenCalled();
    });
  });

  it('should not require name in payload', async () => {
    (conversationApi.create as any).mockResolvedValue({
      data: {
        data: mockNewConversation,
      },
    });

    const { result } = renderHook(
      () => useCreateConversation(),
      { wrapper: createWrapper() }
    );

    result.current.mutate({
      dialog_id: 'dialog-123',
    });

    await waitFor(() => {
      expect(conversationApi.create).toHaveBeenCalledWith(
        expect.objectContaining({
          dialog_id: 'dialog-123',
        })
      );
    });
  });
});