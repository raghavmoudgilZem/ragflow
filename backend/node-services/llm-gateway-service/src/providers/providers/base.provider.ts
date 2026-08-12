import { Injectable } from '@nestjs/common';
import { LlmProvider } from '../interfaces/llm-provider.interface';

@Injectable()
export class BaseProvider implements LlmProvider {
  readonly name = 'base';

  completion(_request: unknown): Promise<unknown> {
    void _request;
    throw new Error('Completion is not implemented for BaseProvider.');
  }

  embedding(_request: unknown): Promise<unknown> {
    void _request;
    throw new Error('Embedding is not implemented for BaseProvider.');
  }
}
