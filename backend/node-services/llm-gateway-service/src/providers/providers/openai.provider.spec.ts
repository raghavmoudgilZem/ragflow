import { OpenAIProvider } from './openai.provider';
import { LLMProvider } from '../../modules/llm/enums/llm-provider.enum';

describe('OpenAIProvider', () => {
  it('should expose the OpenAI provider name', () => {
    const provider = new OpenAIProvider();

    expect(provider.name).toBe(LLMProvider.OPENAI);
  });
});
