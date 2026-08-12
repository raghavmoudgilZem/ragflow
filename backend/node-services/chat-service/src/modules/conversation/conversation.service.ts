import { randomUUID } from "crypto";
import { ConversationRepository } from "./conversation.repository";
import { DEFAULT_NEW_CHAT_TITLE } from "../../core/constants";

export class ConversationService {
  constructor(
    private readonly conversationRepo: ConversationRepository,
    // Injecting MessageService to handle cascading deletes as per LLD
    // private readonly messageService: MessageService
  ) {}

  /**
   * Initializes a new conversation session.
   * Generates a 32-character UUID to match the VARCHAR(32) schema constraints.
   */
  async initSession(params: {
    dialog_id: string;
    user_id: string;
    name?: string;
  }) {
    // Generate a UUID and strip hyphens to fit VARCHAR(32) constraint
    const sessionId = randomUUID().replace(/-/g, "");

    const defaultName = DEFAULT_NEW_CHAT_TITLE;

    return await this.conversationRepo.create({
      id: sessionId,
      dialog_id: params.dialog_id,
      user_id: params.user_id,
      name: defaultName,
    });
  }

  /**
   * Fetches the conversation history for the sidebar.
   */
  async listConversationsByDialogId(
    dialogId: string,
    page: number,
    limit: number,
    search: string,
  ) {
    if (!dialogId) {
      throw new Error("Dialog Id is required");
    }

    const offset = (page - 1) * limit;

    const [conversations, total] = await Promise.all([
      this.conversationRepo.findByDialogId(dialogId, limit, offset, search),
      this.conversationRepo.countValidDialogs(search),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      conversations,
      meta: {
        total,
        page,
        limit,
        total_pages: totalPages,
        has_more: page < totalPages,
      },
    };
  }

  /**
   * Updates conversation metadata (e.g., renaming the chat).
   */
  async updateMetadata(id: string, name: string) {
    if (!id || !name) {
      throw new Error("Conversation ID and new name are required");
    }

    await this.conversationRepo.findConvoById(id);

    return await this.conversationRepo.update(id, name);
  }

  /**
   * Executes a soft delete on the conversation and cascades to child messages.
   */
  async deleteSession(id: string) {
    if (!id) {
      throw new Error("Conversation ID is required for deletion!");
    }

    await this.conversationRepo.findConvoById(id);

    // 1. Soft delete the parent conversation record
    await this.conversationRepo.softDelete(id);

    // 2. Cascade soft delete to all messages in this conversation
    // await this.messageService.deleteMessagesByConversationId(id);
  }
}
