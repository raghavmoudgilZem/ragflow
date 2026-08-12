import { describe, it, expect, vi, beforeEach } from 'vitest';
import { conversationApi } from '@modules/chats/api/conversationApi';
import * as apiClient from '@shared/api/client';

vi.mock('@shared/api/client');

describe('conversationApi', () => {
  const mockApiClient = {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (apiClient.apiClient as any) = mockApiClient;
  });

  describe('list', () => {
    it('should call get with correct endpoint and params', () => {
      mockApiClient.get.mockResolvedValue({
        data: { data: { conversations: [], total: 0 } },
      });

      conversationApi.list('dialog-123');

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/chats/conversation/list',
        {
          params: {
            dialog_id: 'dialog-123',
          },
        }
      );
    });

    it('should include keywords in params when provided', () => {
      mockApiClient.get.mockResolvedValue({
        data: { data: { conversations: [], total: 0 } },
      });

      conversationApi.list('dialog-123',{ keywords: 'test' });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/chats/conversation/list',
        {
          params: {
            dialog_id: 'dialog-123',
            keywords: 'test',
          },
        }
      );
    });

    it('should return conversation list response', async () => {
      const mockData = {
        conversations: [
          {
            id: 'conv-1',
            dialog_id: 'dialog-123',
            name: 'Test',
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

      mockApiClient.get.mockResolvedValue({
        data: { data: mockData },
      });

      const result = await conversationApi.list('dialog-123');

      expect(result.data.data).toEqual(mockData);
    });
  });

  describe('get', () => {
    it('should call get with correct endpoint', () => {
      mockApiClient.get.mockResolvedValue({
        data: { data: {} },
      });

      conversationApi.get('conv-123');

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/chats/conversation/conv-123'
      );
    });

    it('should return single conversation', async () => {
      const mockConversation = {
        id: 'conv-123',
        dialog_id: 'dialog-123',
        name: 'Test',
        avatar: 'T',
        create_date: '2024-01-01',
        create_time: 1704067200000,
        update_date: '2024-01-02',
        update_time: 1704153600000,
        is_new: false,
        message: [],
        reference: [],
      };

      mockApiClient.get.mockResolvedValue({
        data: { data: mockConversation },
      });

      const result = await conversationApi.get('conv-123');

      expect(result.data.data).toEqual(mockConversation);
    });
  });

  describe('create', () => {
    it('should call post with correct endpoint and payload', () => {
      mockApiClient.post.mockResolvedValue({
        data: { data: { id: 'conv-new' } },
      });

      const payload = {
        dialog_id: 'dialog-123',
        name: 'New Conversation',
      };

      conversationApi.create(payload);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/chats/conversation',
        payload
      );
    });

    it('should work without name in payload', () => {
      mockApiClient.post.mockResolvedValue({
        data: { data: { id: 'conv-new' } },
      });

      const payload = {
        dialog_id: 'dialog-123',
      };

      conversationApi.create(payload);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/chats/conversation',
        payload
      );
    });

    it('should return created conversation', async () => {
      const newConversation = {
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

      mockApiClient.post.mockResolvedValue({
        data: { data: newConversation },
      });

      const result = await conversationApi.create({
        dialog_id: 'dialog-123',
        name: 'New Conversation',
      });

      expect(result.data.data).toEqual(newConversation);
    });
  });

  describe('addMessage', () => {
    it('should call post with correct endpoint', () => {
      mockApiClient.post.mockResolvedValue({
        data: { data: { id: 'msg-1' } },
      });

      const message = {
        role: 'user' as const,
        content: 'Hello',
      };

      conversationApi.addMessage('conv-123', message);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/chats/conversation/conv-123/message',
        message
      );
    });

    it('should handle message with doc_ids', () => {
      mockApiClient.post.mockResolvedValue({
        data: { data: { id: 'msg-1' } },
      });

      const message = {
        role: 'user' as const,
        content: 'Hello',
        doc_ids: ['doc-1', 'doc-2'],
      };

      conversationApi.addMessage('conv-123', message);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/chats/conversation/conv-123/message',
        message
      );
    });

    it('should handle assistant message', () => {
      mockApiClient.post.mockResolvedValue({
        data: { data: { id: 'msg-1' } },
      });

      const message = {
        role: 'assistant' as const,
        content: 'Response',
        prompt: 'original prompt',
      };

      conversationApi.addMessage('conv-123', message);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/chats/conversation/conv-123/message',
        message
      );
    });

    it('should return created message', async () => {
      const newMessage = {
        id: 'msg-1',
        role: 'user' as const,
        content: 'Hello',
      };

      mockApiClient.post.mockResolvedValue({
        data: { data: newMessage },
      });

      const result = await conversationApi.addMessage('conv-123', {
        role: 'user',
        content: 'Hello',
      });

      expect(result.data.data).toEqual(newMessage);
    });
  });

  describe('delete', () => {
    it('should call delete with correct endpoint', () => {
      mockApiClient.delete.mockResolvedValue({
        data: { data: { id: 'conv-123' } },
      });

      conversationApi.delete('conv-123');

      expect(mockApiClient.delete).toHaveBeenCalledWith(
        '/chats/conversation/conv-123'
      );
    });

    it('should return deleted conversation id', async () => {
      mockApiClient.delete.mockResolvedValue({
        data: { data: { id: 'conv-123' } },
      });

      const result = await conversationApi.delete('conv-123');

      expect(result.data.data.id).toBe('conv-123');
    });
  });

  describe('stream', () => {
    it('should call get with correct stream endpoint', () => {
      mockApiClient.get.mockResolvedValue({} as EventSource);

      conversationApi.stream('conv-123');

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/chats/conversation/conv-123/stream'
      );
    });

    it('should return EventSource for streaming', async () => {
      const mockEventSource = new EventTarget() as any as EventSource;
      mockApiClient.get.mockResolvedValue(mockEventSource);

      const result = await conversationApi.stream('conv-123');

      expect(result).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should propagate get errors', async () => {
      const error = new Error('Network error');
      mockApiClient.get.mockRejectedValue(error);

      await expect(
        conversationApi.list('dialog-123')
      ).rejects.toThrow('Network error');
    });

    it('should propagate post errors', async () => {
      const error = new Error('Validation error');
      mockApiClient.post.mockRejectedValue(error);

      await expect(
        conversationApi.create({ dialog_id: 'dialog-123' })
      ).rejects.toThrow('Validation error');
    });

    it('should propagate delete errors', async () => {
      const error = new Error('Not found');
      mockApiClient.delete.mockRejectedValue(error);

      await expect(
        conversationApi.delete('conv-123')
      ).rejects.toThrow('Not found');
    });
  });

  describe('Endpoint Correctness', () => {
    it('should use correct endpoint paths', () => {
      const getEndpoints: string[] = [];
      const postEndpoints: string[] = [];
      const deleteEndpoints: string[] = [];

      mockApiClient.get.mockImplementation((endpoint) => {
        getEndpoints.push(endpoint);
        return Promise.resolve({ data: { data: {} } });
      });

      mockApiClient.post.mockImplementation((endpoint) => {
        postEndpoints.push(endpoint);
        return Promise.resolve({ data: { data: {} } });
      });

      mockApiClient.delete.mockImplementation((endpoint) => {
        deleteEndpoints.push(endpoint);
        return Promise.resolve({ data: { data: {} } });
      });

      // Execute calls
      conversationApi.list('dialog-123');
      conversationApi.get('conv-123');
      conversationApi.create({ dialog_id: 'dialog-123' });
      conversationApi.addMessage('conv-123', { role: 'user', content: 'test' });
      conversationApi.stream('conv-123');
      conversationApi.delete('conv-123');

      // Assertions
      expect(getEndpoints).toContain('/chats/conversation/list');
      expect(getEndpoints).toContain('/chats/conversation/conv-123');
      expect(getEndpoints).toContain('/chats/conversation/conv-123/stream');
      expect(postEndpoints).toContain('/chats/conversation');
      expect(postEndpoints).toContain('/chats/conversation/conv-123/message');
      expect(deleteEndpoints).toContain('/chats/conversation/conv-123');
    });
  });
});
