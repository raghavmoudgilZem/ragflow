import { Inject, Injectable } from '@nestjs/common';
import { LlmProvider } from './interfaces/llm-provider.interface';
import { LLM_PROVIDERS } from './constants/provider.tokens';

@Injectable()
export class ProviderResolver {
  constructor(
    @Inject(LLM_PROVIDERS)
    private readonly providers: LlmProvider[],
  ) {}

  resolve(name: string): LlmProvider | undefined {
    return this.providers.find((provider) => provider.name === name);
  }
}
