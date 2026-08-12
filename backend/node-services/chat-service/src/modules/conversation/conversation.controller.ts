// src/modules/conversation/conversation.controller.ts
import { Request, Response } from "express";
import { ConversationService } from "./conversation.service";
import { constants } from "node:http2";
import { sendSuccess } from "../../core/utils/response.utils";

export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  /**
   * POST /api/v1/dialogs/:dialog_id/conversations
   * Initializes a new chat session.
   */
  async initSession(req: Request, res: Response): Promise<void> {
    const { dialog_id } = req.body;

    // const userId = req.user?.id ?? "anonymous";
    const userId = "anonymous";

    const conversation = await this.conversationService.initSession({
      dialog_id: dialog_id as string,
      user_id: userId,
    });

    sendSuccess(res, constants.HTTP_STATUS_CREATED, conversation);
  }

  /**
   * GET /api/v1/dialogs/:dialog_id/conversations
   * Lists all conversations for the sidebar excluding deleted ones.
   */
  async listConversations(req: Request, res: Response): Promise<void> {
    const { d_id: dialog_id } = req.params;

    // Default to page 1 and limit 10 if not provided
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.page_size as string, 10) || 10;
    const search = (req.query.keywords as string) || "";

    // Optional constraint: cap the maximum limit per request
    const safeLimit = limit > 100 ? 100 : limit;

    const conversations =
      await this.conversationService.listConversationsByDialogId(
        dialog_id as string,
        page,
        safeLimit,
        search,
      );

    sendSuccess(res, constants.HTTP_STATUS_OK, conversations);
  }

  /**
   * PATCH /api/v1/conversations/:id
   * Updates conversation metadata (e.g., changing the chat title).
   */
  async updateConversation(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { name } = req.body;

    const updatedConversation = await this.conversationService.updateMetadata(
      id as string,
      name,
    );

    sendSuccess(res, constants.HTTP_STATUS_OK, updatedConversation);
  }

  /**
   * DELETE /api/v1/conversations/:id
   * Soft deletes the session and cascades to child messages.
   */
  async deleteConversation(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    await this.conversationService.deleteSession(id as string);

    // 204 No Content for successful deletion as per LLD

    sendSuccess(res, constants.HTTP_STATUS_NO_CONTENT);
  }
}
