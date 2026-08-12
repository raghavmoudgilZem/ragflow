import { OllamaProvider } from './ollama.provider';
import { LLMProvider } from '../../modules/llm/enums/llm-provider.enum';

describe('OllamaProvider', () => {
  it('should expose the Ollama provider name', () => {
    const provider = new OllamaProvider();

    expect(provider.name).toBe(LLMProvider.OLLAMA);
  });
});
