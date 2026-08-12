export interface LlmProvider {
  readonly name: string;

  completion(request: unknown): Promise<unknown>;

  embedding(request: unknown): Promise<unknown>;
}
