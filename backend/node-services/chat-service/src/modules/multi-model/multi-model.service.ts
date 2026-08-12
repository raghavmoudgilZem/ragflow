import { Response } from "express";
import { DialogService } from "../dialog/dialog.service";
import {
  RagConfig,
  RagProviderService,
} from "../rag-provider/rag-provider.service";

export interface MultiModelPayload {
  prompt: string;
  models: RagConfig[];
}

export class MultiModelService {
  constructor(
    private readonly ragProvider: RagProviderService,
    private readonly dialogService: DialogService,
  ) {}

  /**
   * Initializes a new conversation session.
   * Generates a 32-character UUID to match the VARCHAR(32) schema constraints.
   */
  async selectModel(
    dialogId: string,
    updatedValue: {
      llm_id?: string | null;
      llm_setting?: unknown;
      prompt_type?: string | null;
      prompt_config?: unknown;
      meta_data_filter?: unknown;
      similarity_threshold?: number | null;
      vector_similarity_weight?: number | null;
      top_n?: number | null;
      top_k?: number | null;
      do_refer?: string | null;
      rerank_id?: string | null;
      kb_ids?: string[] | null;
    },
  ) {
    this.dialogService.updateDialog(dialogId, updatedValue);
  }

  async streamMultiCompletion(
    payload: MultiModelPayload,
    res: Response,
    clientSignal: AbortSignal,
  ): Promise<void> {
    // 1. Single Hydration (Mocked RetrievalService Call)
    // Replace this with actual vector DB fetch
    const hydratedContext = `[Context from VectorDB] User Prompt: ${payload.prompt}`;

    // 2. Concurrent Fan-Out Execution
    const streamPromises = payload.models.map(async (modelConfig) => {
      try {
        const stream = this.ragProvider.generateStream(
          hydratedContext,
          modelConfig,
          clientSignal,
        );

        // 3. Consume async generator and pipe to Express response
        for await (const chunk of stream) {
          const envelope = JSON.stringify({
            config_id: modelConfig.config_id,
            chunk: chunk,
          });
          res.write(`data: ${envelope}\n\n`);
        }

        // Emit model-specific completion event
        res.write(
          `event: model_done\ndata: ${JSON.stringify({ config_id: modelConfig.config_id })}\n\n`,
        );
      } catch (error: any) {
        // Handle aborts or downstream LLM timeouts gracefully without crashing siblings
        if (error.message.includes("aborted")) return; // Silent exit if client disconnected

        const errorEnvelope = JSON.stringify({
          config_id: modelConfig.config_id,
          reason: error.message || "timeout",
        });
        res.write(`event: model_error\ndata: ${errorEnvelope}\n\n`);
      }
    });

    // 4. Await all streams (Success or Failure) non-blockingly
    await Promise.allSettled(streamPromises);

    // 5. Global cleanup if client didn't drop connection
    if (!clientSignal.aborted) {
      res.write(`event: done\ndata: {}\n\n`);
      res.end();
    }
  }
}
