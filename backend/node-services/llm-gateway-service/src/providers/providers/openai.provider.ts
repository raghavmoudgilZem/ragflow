import { Injectable } from '@nestjs/common';
import { LlmProvider } from '../interfaces/llm-provider.interface';
import { LLMProvider } from '../../modules/llm/enums/llm-provider.enum';

@Injectable()
export class OpenAIProvider implements LlmProvider {
  readonly name = LLMProvider.OPENAI;

  completion(_request: unknown): Promise<unknown> {
    void _request;
    throw new Error('Completion is not implemented for OpenAIProvider.');
  }

  embedding(_request: unknown): Promise<unknown> {
    void _request;
    throw new Error('Embedding is not implemented for OpenAIProvider.');
  }
}
