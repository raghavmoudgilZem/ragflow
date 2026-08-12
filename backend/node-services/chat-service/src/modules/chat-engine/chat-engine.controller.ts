import { Request, Response } from "express";
import { logger } from "../../core/services/logger.service";
import { IChatCompletionDto } from "./chat-engine.interfaces";
import { ChatEngineService } from "./chat-engine.service";

export class ChatEngineController {
  constructor(private readonly service: ChatEngineService) {}

  streamCompletion = async (req: Request, res: Response) => {
    const dto: IChatCompletionDto = req.body;

    // 1. Establish SSE HTTP Headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    // Ensure payload reaches client immediately avoiding proxy buffering
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    // 2. Handle Client Disconnect Mid-Stream
    let isStreamActive = true;
    req.on("close", () => {
      isStreamActive = false;
      // In a real LLM scenario, you would trigger an AbortController here
      // to cancel the downstream gRPC/HTTP request to the LLM.
    });

    try {
      // 3. Execute Orchestration & Pipe Chunks
      const messageId = await this.service.processChatStream(
        dto,
        (chunk: any) => {
          if (!isStreamActive) return;
          // Format strictly to Server-Sent Events standard
          res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
        },
      );

      // 4. Emit Final Metadata Event
      if (isStreamActive) {
        res.write(
          `event: metadata\ndata: ${JSON.stringify({ message_id: messageId })}\n\n`,
        );
        res.end();
      }
    } catch (error) {
      logger.error(`[SSE Error] ---> ${JSON.stringify(error)}`);
      if (isStreamActive) {
        res.write(
          `event: error\ndata: ${JSON.stringify({ code: "INTERNAL_STREAM_ERROR" })}\n\n`,
        );
        res.end();
      }
    }
  };
}
