import { Module } from '@nestjs/common';
import { ProviderResolver } from './provider.resolver';
import { BaseProvider } from './providers/base.provider';
import { LLM_PROVIDERS } from './constants/provider.tokens';
import { OpenAIProvider } from './providers/openai.provider';
import { OllamaProvider } from './providers/ollama.provider';

@Module({
  providers: [
    BaseProvider,
    OpenAIProvider,
    OllamaProvider,
    {
      provide: LLM_PROVIDERS,
      useFactory: (
        baseProvider: BaseProvider,
        openAIProvider: OpenAIProvider,
        ollamaProvider: OllamaProvider,
      ) => [baseProvider, openAIProvider, ollamaProvider],
      inject: [BaseProvider, OpenAIProvider, OllamaProvider],
    },
    ProviderResolver,
  ],
  exports: [ProviderResolver],
})
export class ProvidersModule {}
