// src/modules/dialog/dialog.controller.ts
import { Request, Response } from "express";
import { DialogService } from "./dialog.service";
import { sendSuccess } from "../../core/utils/response.utils";
import { constants } from "node:http2";

export class DialogController {
  constructor(private readonly dialogService: DialogService) {}

  /**
   * POST /api/v1/dialogs
   * Creates a new Dialog configuration.
   */
  async createDialog(req: Request, res: Response): Promise<void> {
    // Payload constraints based on LLD
    const { name, llm_id, llm_setting, prompt_config, kb_ids } = req.body;

    const newDialog = await this.dialogService.createDialog({
      name,
      llm_id,
      llm_setting,
      prompt_config,
      kb_ids,
    });

    // 201 Created response returning the full Dialog object
    sendSuccess(res, constants.HTTP_STATUS_CREATED, newDialog);
  }

  /**
   * GET /api/v1/dialogs
   * Lists all dialogs sorted by created_at DESC.
   */
  async listDialogs(req: Request, res: Response): Promise<void> {
    // Default to page 1 and limit 10 if not provided
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.page_size as string, 10) || 10;
    const search = (req.query.keywords as string) || "";

    // Optional constraint: cap the maximum limit per request
    const safeLimit = limit > 100 ? 100 : limit;

    const paginatedDialogs = await this.dialogService.listDialogs(
      page,
      safeLimit,
      search,
    );

    sendSuccess(res, constants.HTTP_STATUS_OK, paginatedDialogs);
  }

  /**
   * GET /api/v1/dialogs/:id
   * Returns dialog.
   */
  async getDialogById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const foundDialog = await this.dialogService.getDialogById(id as string);

    sendSuccess(res, constants.HTTP_STATUS_OK, foundDialog);
  }

  /**
   * PATCH /api/v1/dialogs/:id
   * Partially updates a Dialog configuration (e.g., changing similarity_threshold).
   */
  async updateDialog(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const updatePayload = req.body;

    const updatedDialog = await this.dialogService.updateDialog(
      id as string,
      updatePayload,
    );

    sendSuccess(res, constants.HTTP_STATUS_OK, updatedDialog);
  }

  /**
   * DELETE /api/v1/dialogs/:id
   * Deletes the dialog and cascades soft-deletion to linked Conversations.
   */
  async deleteDialog(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    await this.dialogService.deleteDialog(id as string);

    // 204 No Content for successful deletion as specified in the LLD
    sendSuccess(res, constants.HTTP_STATUS_NO_CONTENT);
  }
}
