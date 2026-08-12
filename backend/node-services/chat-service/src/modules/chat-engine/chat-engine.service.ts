import { randomUUID } from "crypto";
import { MessagesService } from "../messages/messages.service"; // Cross-module import
import { IChatCompletionDto } from "./chat-engine.interfaces";

export class ChatEngineService {
  constructor(private readonly messagesService: MessagesService) {}

  /**
   * Orchestrates the RAG flow and SSE stream generation.
   */
  async processChatStream(
    dto: IChatCompletionDto,
    onChunk: (chunk: string) => void,
  ): Promise<string> {
    const userMsgId = randomUUID().replace(/-/g, "");

    // 1. Pre-Stream: Persist User Prompt
    await this.messagesService.createMessage({
      id: userMsgId,
      conversation_id: dto.conversation_id,
      parent_id: null,
      role: "user",
      content: dto.content,
      llm_id: dto.llm_id,
    });

    // 2. Stream Generation (Mock Context Hydration & Jitter)
    let fullResponse = "";

    for await (const chunk of this.generateMockLlmStream(dto.content)) {
      fullResponse += chunk;
      onChunk(chunk); // Fire callback to stream chunk to client immediately
    }

    // 3. Post-Stream: Persist AI Response
    // Ensure 32-char varchar match
    const assistantMsgId = randomUUID().replace(/-/g, "");

    await this.messagesService.createMessage({
      id: assistantMsgId,
      conversation_id: dto.conversation_id,
      parent_id: userMsgId, // Links to the user prompt ID
      role: "assistant",
      content: fullResponse.trim(),
      llm_id: dto.llm_id || "mock-llm",
    });

    return assistantMsgId;
  }

  /**
   * Mock Token Generator with Network Jitter (20ms - 150ms)
   */
  private async *generateMockLlmStream(prompt: string): AsyncGenerator<string> {
    const mockString = `This is a mock response from the Chat Engine evaluating your prompt: "${prompt}". In a live setup, this would be replaced by an external LLM microservice utilizing Retrieval-Augmented Generation (RAG).`;
    const tokens = mockString.split(" ");

    for (const token of tokens) {
      // Calculate randomized jitter to simulate network latency
      const delayMs = Math.floor(Math.random() * (150 - 20 + 1)) + 20;
      await new Promise((resolve) => setTimeout(resolve, delayMs));

      yield token + " "; // Yield token with space
    }
  }
}
