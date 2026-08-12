import { ProviderResolver } from '../provider.resolver';
import { BaseProvider } from '../providers/base.provider';
import { OpenAIProvider } from '../providers/openai.provider';
import { OllamaProvider } from '../providers/ollama.provider';
import { LLMProvider } from '../../modules/llm/enums/llm-provider.enum';

describe('ProviderResolver', () => {
  it('should resolve a registered provider', () => {
    const provider = new BaseProvider();
    const openAIProvider = new OpenAIProvider();
    const ollamaProvider = new OllamaProvider();

    const resolver = new ProviderResolver([
      provider,
      openAIProvider,
      ollamaProvider,
    ]);

    expect(resolver.resolve('base')).toBe(provider);
    expect(resolver.resolve(LLMProvider.OPENAI)).toBe(openAIProvider);
    expect(resolver.resolve(LLMProvider.OLLAMA)).toBe(ollamaProvider);
  });

  it('should return undefined for an unknown provider', () => {
    const resolver = new ProviderResolver([]);

    expect(resolver.resolve('unknown')).toBeUndefined();
  });
});
