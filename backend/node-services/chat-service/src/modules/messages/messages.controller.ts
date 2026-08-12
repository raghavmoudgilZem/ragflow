import { Request, Response } from "express";
import { MessagesService } from "./messages.service";
import { catchAsync } from "../../core/middleware/catchAsync"; // Assumed core middleware
import { sendSuccess } from "../../core/utils/response.utils";
import { constants } from "node:http2";

export class MessagesController {
  constructor(private readonly service: MessagesService) {}

  async getHistory(req: Request, res: Response) {
    const { conversationId } = req.params;
    const cursor = req.query.cursor as string;
    const limit = parseInt(req.query.limit as string, 10);

    const result = await this.service.getHistory({
      conversationId: conversationId as string,
      cursor,
      limit,
    });

    sendSuccess(res, constants.HTTP_STATUS_OK, result);
  }

  updateFeedback = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { thumbup, feedback } = req.body;

    await this.service.updateFeedback(id as string, { thumbup, feedback });

    sendSuccess(
      res,
      constants.HTTP_STATUS_OK,
      "Feedback updated successfully.",
    );
  });

  deletePair = catchAsync(async (req: Request, res: Response) => {
    const { parentId } = req.params;

    await this.service.deletePair(parentId as string);

    sendSuccess(res, constants.HTTP_STATUS_NO_CONTENT);
  });
}
