import { Router, Response } from "express";
import { ApiResponse, IConversation, IDialog, Message, MessageType } from "./data.js";
import { chatRepository } from "./repository.js"
export function registerChatRoutes(router: Router) {

  router.post('/chats/dialog/list', (req, res) => {
    const page = Number(req.query.page ?? 1);
    const page_size = Number(req.query.page_size ?? 10);
    const keywords = String(req.query.keywords ?? '');

    // Validate pagination
    if (page < 1 || page_size < 1) {
      const response: ApiResponse<null> = {
        success: false,
        status_code: 400,
        error: 'Invalid pagination parameters',
      };
      res.status(400).json(response);
      return;
    }

    // Filter by keywords
    const allDialogs = chatRepository.getDialogs();
    const filtered = keywords
      ? allDialogs.filter((d) => d.name.toLowerCase().includes(keywords.toLowerCase()))
      : allDialogs;

    // Paginate
    const start = (page - 1) * page_size;
    const items = filtered.slice(start, start + page_size);

    const response: ApiResponse<{ dialogs: IDialog[]; total: number }> = {
      success: true,
      status_code: 200,
      data: { dialogs: items, total: filtered.length },
    };
    res.status(200).json(response);
  });

  // Get a single dialog by Chat_ID
  router.get('/chats/dialog/:chat_id', (req, res) => {
    const dialog = chatRepository.getDialogById(req.params.chat_id);

    if (!dialog) {
      const response: ApiResponse<null> = {
        success: false,
        status_code: 400,
        error: 'Dialog not found',
      };
      res.status(400).json(response);
      return;
    }

    const response: ApiResponse<IDialog> = {
      success: true,
      status_code: 200,
      data: dialog,
    };
    res.status(200).json(response);
  });

  // Create a new dialog (chat)
  router.post('/chats/dialog', (req, res) => {
    const {
      name,
      description = '',
      kb_ids = [],
      kb_names = [],
      language = 'en',
      llm_id = 'gpt-4',
    } = req.body as {
      name: string;
      description?: string;
      kb_ids?: string[];
      kb_names?: string[];
      language?: string;
      llm_id?: string;
    };

    // Validate required fields
    if (!name || name.trim() === '') {
      const response: ApiResponse<null> = {
        success: false,
        status_code: 400,
        error: 'Dialog name is required',
      };
      res.status(400).json(response);
      return;
    }

    const now = new Date();
    const dialog_id = `dialog-${Date.now()}`;

    const newDialog: IDialog = {
      create_date: now.toISOString().split('T')[0],
      create_time: Date.now(),
      description,
      icon: '🤖',
      id: `chat-${Date.now()}`,
      dialog_id,
      kb_ids,
      kb_names,
      language,
      llm_id,
      llm_setting: { temperature: 0.7, max_tokens: 2048, top_p: 0.9 },
      llm_setting_type: 'Evenly',
      name,
      prompt_config: {
        empty_response: 'I could not find an answer.',
        parameters: [{ key: 'query', optional: false }],
        prologue: 'You are a helpful assistant.',
        system: 'Answer queries based on the knowledge base.',
        quote: true,
        keyword: true,
        refine_multiturn: true,
        use_kg: true,
      },
      prompt_type: 'rag',
      status: 'active',
      tenant_id: 'tenant-001',
      update_date: now.toISOString().split('T')[0],
      update_time: Date.now(),
      vector_similarity_weight: 0.5,
      similarity_threshold: 0.6,
      top_k: 10,
      top_n: 5,
    };

    chatRepository.createDialog(newDialog);

    const response: ApiResponse<IDialog> = {
      success: true,
      status_code: 201,
      data: newDialog,
    };
    res.status(201).json(response);
  });

  // Update a dialog
  router.put('/chats/dialog/:chat_id', (req, res) => {
    const { name, description, llm_setting, prompt_config } = req.body;
    const dialog = chatRepository.getDialogById(req.params.chat_id);

    if (!dialog) {
      const response: ApiResponse<null> = {
        success: false,
        status_code: 400,
        error: 'Dialog not found',
      };
      res.status(400).json(response);
      return;
    }

    const now = new Date();
    const updated = chatRepository.updateDialog(req.params.chat_id, {
      name: name || dialog.name,
      description: description !== undefined ? description : dialog.description,
      llm_setting: llm_setting ? { ...dialog.llm_setting, ...llm_setting } : dialog.llm_setting,
      prompt_config: prompt_config ? { ...dialog.prompt_config, ...prompt_config } : dialog.prompt_config,
      update_time: Date.now(),
      update_date: now.toISOString().split('T')[0],
    });

    const response: ApiResponse<IDialog> = {
      success: true,
      status_code: 200,
      data: updated!,
    };
    res.status(200).json(response);
  });

  // Delete a dialog
  router.delete('/chats/dialog/:chat_id', (req, res) => {
    const deleted = chatRepository.deleteDialog(req.params.chat_id);

    if (!deleted) {
      const response: ApiResponse<null> = {
        success: false,
        status_code: 400,
        error: 'Dialog not found',
      };
      res.status(400).json(response);
      return;
    }

    const response: ApiResponse<{ id: string }> = {
      success: true,
      status_code: 200,
      data: { id: req.params.chat_id },
    };
    res.status(200).json(response);
  });

  // Batch delete dialogs
  router.post('/chats/dialog/batch/delete', (req, res) => {
    const { ids } = req.body as { ids: string[] };

    if (!Array.isArray(ids) || ids.length === 0) {
      const response: ApiResponse<null> = {
        success: false,
        status_code: 400,
        error: 'Invalid or empty ids array',
      };
      res.status(400).json(response);
      return;
    }

    const deleted = chatRepository.deleteDialogs(ids);

    const response: ApiResponse<{ deleted: string[] }> = {
      success: true,
      status_code: 200,
      data: { deleted },
    };
    res.status(200).json(response);
  });

}

const activeConnections: Map<string, Set<Response>> = new Map();

export function registerConversationRoutes(router: Router) {

  // List conversations for a dialog with optional search
  router.get('/chats/conversation/list', (req, res) => {
    const dialog_id = (req.query.dialog_id as string) ?? '';
    const keywords = (req.query.keywords as string) ?? '';

    if (!dialog_id) {
      const response: ApiResponse<null> = {
        success: false,
        status_code: 400,
        error: 'dialog_id is required',
      };
      res.status(400).json(response);
      return;
    }

    const all = chatRepository.getConversations(dialog_id);

    const filtered = keywords
      ? all.filter((c:any) => c.name.toLowerCase().includes(keywords.toLowerCase()))
      : all;

    const sorted = [...filtered].sort((a, b) => b.update_time - a.update_time);

    const response: ApiResponse<{ conversations: IConversation[]; total: number }> = {
      success: true,
      status_code: 200,
      data: { conversations: sorted, total: filtered.length },
    };
    res.status(200).json(response);
  });

  // Get a single conversation
  router.get('/chats/conversation/:id', (req, res) => {
    const conversation = chatRepository.getConversationById(req.params.id);

    if (!conversation) {
      const response: ApiResponse<null> = {
        success: false,
        status_code: 400,
        error: 'Conversation not found',
      };
      res.status(400).json(response);
      return;
    }

    const response: ApiResponse<IConversation> = {
      success: true,
      status_code: 200,
      data: conversation,
    };
    res.status(200).json(response);
  });

  // Create a new conversation in a dialog
  router.post('/chats/conversation', (req, res) => {
    const { dialog_id, name = 'New Conversation' } = req.body as {
      dialog_id: string;
      name?: string;
    };

    if (!dialog_id) {
      const response: ApiResponse<null> = {
        success: false,
        status_code: 400,
        error: 'dialog_id is required',
      };
      res.status(400).json(response);
      return;
    }

    const now = new Date();

    const newConversation: IConversation = {
      create_date: now.toISOString().split('T')[0],
      create_time: Date.now(),
      dialog_id,
      id: `conv-${Date.now()}`,
      avatar: '👤',
      name,
      message: [],
      reference: [],
      update_date: now.toISOString().split('T')[0],
      update_time: Date.now(),
      is_new: true,
    };

    chatRepository.createConversation(newConversation);

    const response: ApiResponse<IConversation> = {
      success: true,
      status_code: 201,
      data: newConversation,
    };
    res.status(201).json(response);
  });

  // Add a message to a conversation
  router.post('/chats/conversation/:id/message', (req, res) => {
    const { content, role, doc_ids = [], prompt = '' } = req.body as {
      content: string;
      role: MessageType;
      doc_ids?: string[];
      prompt?: string;
    };

    if (!content || !role) {
      const response: ApiResponse<null> = {
        success: false,
        status_code: 400,
        error: 'content and role are required',
      };
      res.status(400).json(response);
      return;
    }

    const conversation = chatRepository.getConversationById(req.params.id);

    if (!conversation) {
      const response: ApiResponse<null> = {
        success: false,
        status_code: 400,
        error: 'Conversation not found',
      };
      res.status(400).json(response);
      return;
    }

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      role,
      content,
      ...(doc_ids.length > 0 && { doc_ids }),
      ...(prompt && { prompt }),
    };

    chatRepository.addMessageToConversation(req.params.id, newMessage);

    chatRepository.updateConversation(req.params.id, {
      update_time: Date.now(),
      update_date: new Date().toISOString().split('T')[0],
      is_new: false,
    });

    const response: ApiResponse<Message> = {
      success: true,
      status_code: 201,
      data: newMessage,
    };
    res.status(201).json(response);

    if (role === 'user') {
      generateAndStreamResponse(req.params.id, content);
    }
  });

  router.get('/chats/conversation/:id/stream', (req, res) => {
    const conversationId = req.params.id;

    const conversation = chatRepository.getConversationById(conversationId);

    if (!conversation) {
      res.status(404).json({
        success: false,
        status_code: 404,
        error: 'Conversation not found',
      });
      return;
    }

    // Setup SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (!activeConnections.has(conversationId)) {
      activeConnections.set(conversationId, new Set());
    }
    activeConnections.get(conversationId)!.add(res);

    res.write('data: {"type":"connected","message":"SSE connection established"}\n\n');

    req.on('close', () => {
      const connections = activeConnections.get(conversationId);
      if (connections) {
        connections.delete(res);
        if (connections.size === 0) {
          activeConnections.delete(conversationId);
        }
      }
      res.end();
    });
  });

  // Delete a conversation
  router.delete('/chats/conversation/:id', (req, res) => {
    const deleted = chatRepository.deleteConversation(req.params.id);

    if (!deleted) {
      const response: ApiResponse<null> = {
        success: false,
        status_code: 400,
        error: 'Conversation not found',
      };
      res.status(400).json(response);
      return;
    }

    const response: ApiResponse<{ id: string }> = {
      success: true,
      status_code: 200,
      data: { id: req.params.id },
    };
    res.status(200).json(response);
  });
}

function generateAndStreamResponse(conversationId: string, userMessage: string): void {
  const connections = activeConnections.get(conversationId);

  if (!connections || connections.size === 0) {
    console.log(`No active SSE connections for conversation ${conversationId}`);
    return;
  }

  const mockResponses: Record<string, string> = {
    'refund': 'Our refund policy allows returns within 30 days of purchase for a full refund. Please ensure the item is in its original condition and packaging.',
    'shipping': 'I apologize for the shipping delay. You can track your order using the tracking number in your confirmation email. Typical delivery time is 5-7 business days.',
    'policy': 'According to our HR policy, employees receive 10 paid sick days per year, plus company holidays.',
    'default': 'Thank you for your question. Based on our knowledge base, I can help you with that. Please let me know if you need more specific information.',
  };

  let selectedResponse = mockResponses['default'];
  for (const [keyword, response] of Object.entries(mockResponses)) {
    if (userMessage.toLowerCase().includes(keyword)) {
      selectedResponse = response;
      break;
    }
  }

  const conversation = chatRepository.getConversationById(conversationId);
  if (!conversation) return;

  const messageId = `msg-${Date.now()}`;
  let fullContent = '';

  // Simulate streaming response with chunks
  const words = selectedResponse.split(' ');
  let currentChunk = 0;

  const streamInterval = setInterval(() => {
    if (currentChunk >= words.length) {
      const assistantMessage: Message = {
        id: messageId,
        role: 'assistant',
        content: fullContent,
        prompt: 'Mock LLM response',
      };

      // Add complete message to conversation
      chatRepository.addMessageToConversation(conversationId, assistantMessage);
      chatRepository.updateConversation(conversationId, {
        update_time: Date.now(),
        update_date: new Date().toISOString().split('T')[0],
      });

      // Notify all connections that message is complete
      connections.forEach((res) => {
        res.write(
          `data: ${JSON.stringify({
            type: 'message_complete',
            message: assistantMessage,
          })}\n\n`
        );
      });

      clearInterval(streamInterval);
      return;
    }

    // Stream word chunk
    const word = words[currentChunk];
    fullContent += (currentChunk === 0 ? '' : ' ') + word;

    connections.forEach((res) => {
      res.write(
        `data: ${JSON.stringify({
          type: 'chunk',
          delta: word + (currentChunk < words.length - 1 ? ' ' : ''),
          id: messageId,
        })}\n\n`
      );
    });

    currentChunk++;
  }, 100);
}