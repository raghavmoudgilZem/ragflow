export interface RagConfig {
  config_id: string;
  llm_id: string;
  llm_setting: Record<string, any>;
}

export class RagProviderService {
  /**
   * Pure async generator yielding token chunks.
   * Gracefully halts if the AbortSignal is triggered by client disconnect or timeouts.
   */
  async *generateStream(
    hydratedPrompt: string,
    config: RagConfig,
    signal: AbortSignal,
  ): AsyncGenerator<string> {
    const mockString = `Simulating stream for model ${config.llm_id} (Config: ${config.config_id}). Prompt: ${hydratedPrompt}`;
    const tokens = mockString.split(" ");

    for (const token of tokens) {
      if (signal.aborted) {
        throw new Error(`StreamAborted: Config ${config.config_id}`);
      }

      // Simulate network jitter (20ms - 150ms)
      const delayMs = Math.floor(Math.random() * (150 - 20 + 1)) + 20;

      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(resolve, delayMs);
        signal.addEventListener(
          "abort",
          () => {
            clearTimeout(timeout);
            reject(new Error("Stream aborted during delay"));
          },
          { once: true },
        );
      });

      yield token + " ";
    }
  }
}
