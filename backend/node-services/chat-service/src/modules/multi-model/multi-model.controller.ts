import { NextFunction, Request, Response } from "express";
import { constants } from "node:http2";
import { sendSuccess } from "../../core/utils/response.utils";
import { MultiModelService } from "./multi-model.service";

export class MultiModelController {
  constructor(private readonly multiModelService: MultiModelService) {}

  async selectModel(req: Request, res: Response): Promise<void> {
    if (!req.params?.dialogId) {
      throw new Error("Dialog Id is required.");
    }

    const selecteModel = await this.multiModelService.selectModel(
      req.params?.dialogId as string,
      req.body,
    ); // req.body is validated before reaching to controller

    sendSuccess(res, constants.HTTP_STATUS_OK, selecteModel);
  }

  /**
   * POST /api/v1/chat/multi-model/stream
   * Stateless BFF multiplexer for concurrent LLM streaming.
   */
  async multiCompletion(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      // 1. Establish SSE Headers
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders();

      // 2. Setup AbortController for Client Disconnects
      const abortController = new AbortController();

      req.on("close", () => {
        // Trigger abort signal to halt downstream Promise.allSettled() fetches
        abortController.abort();
        res.end();
      });

      // 3. Delegate Fan-Out to Service Layer
      // The service requires the Express Response object to pipe tagged chunks directly
      await this.multiModelService.streamMultiCompletion(
        req.body,
        res,
        abortController.signal,
      );

      // Note: The service is responsible for emitting the final 'event: done'
      // and calling res.end() when all downstream streams resolve.
    } catch (error) {
      // 4. Graceful Error Handling Mid-Stream
      if (res.headersSent) {
        // If headers are already sent, standard error middleware won't work.
        // We must emit an SSE error envelope and close the stream.
        res.write(
          `event: error\ndata: ${JSON.stringify({ code: "INTERNAL_SERVER_ERROR" })}\n\n`,
        );
        res.end();
      } else {
        next(error);
      }
    }
  }
}
