// src/modules/dialog/dialog.service.ts
import crypto from "crypto";
import { DialogRepository } from "./dialog.repository";

export class DialogService {
  constructor(private readonly dialogRepo: DialogRepository) {}

  /**
   * Creates a new Dialog configuration.
   * Blindly trusts kb_ids from frontend as per constraints.
   */
  async createDialog(payload: any) {
    // Generate a 32-character ID (UUIDv4 stripped of hyphens) to match VARCHAR(32)
    const id = crypto.randomUUID().replace(/-/g, "");

    return this.dialogRepo.create({
      id,
      ...payload,
    });
  }

  /**
   * Lists all dialogs sorted chronologically.
   */
  async listDialogs(page: number, limit: number, search: string) {
    const offset = (page - 1) * limit;

    // Execute data fetch and count queries concurrently
    const [dialogs, total] = await Promise.all([
      this.dialogRepo.findAll(limit, offset, search),
      this.dialogRepo.countValidDialogs(search),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      dialogs,
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
   * Lists all dialogs sorted chronologically.
   */
  async getDialogById(dialogId: string) {
    if (!dialogId) {
      throw new Error("Dialog Id is required");
    }

    // Execute data fetch and count queries concurrently
    const [dialog] = await this.dialogRepo.findDialogById(dialogId);

    return dialog;
  }

  /**
   * Updates Dialog configuration properties.
   */
  async updateDialog(id: string, payload: any) {
    await this.dialogRepo.findDialogById(id);

    return this.dialogRepo.update(id, payload);
  }

  /**
   * Deletes the dialog and orchestrates asynchronous soft-deletion of linked Conversations.
   */
  async deleteDialog(id: string): Promise<void> {
    if (!id) {
      throw new Error("Chat ID is required for deletion!");
    }

    await this.dialogRepo.findDialogById(id);

    // 1. Synchronously soft-delete the Dialog to confirm success to the client
    await this.dialogRepo.softDelete(id);

    // 2. Asynchronous Cascade Conversation
  }
}
