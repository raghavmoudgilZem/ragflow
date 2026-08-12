import { Injectable, BadRequestException } from '@nestjs/common';

export interface ResolvedLlmConfiguration {
  provider: string;
  model: string;
}

@Injectable()
export class LlmConfigurationResolverService {
  resolve(provider: string, model: string): ResolvedLlmConfiguration {
    if (!provider) {
      throw new BadRequestException('Provider is required.');
    }

    if (!model) {
      throw new BadRequestException('Model is required.');
    }

    return {
      provider,
      model,
    };
  }
}
