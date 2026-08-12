import { Injectable, NotFoundException } from '@nestjs/common';
import { ProviderResolver } from '../../providers/provider.resolver';
import { CompletionRequestDto } from './dto/completion-request.dto';
import { EmbeddingRequestDto } from './dto/embedding-request.dto';
import { LlmConfigurationResolverService } from './services/llm-configuration-resolver.service';

@Injectable()
export class LlmRoutingService {
  constructor(
    private readonly providerResolver: ProviderResolver,
    private readonly configurationResolver: LlmConfigurationResolverService,
  ) {}

  async completion(request: CompletionRequestDto): Promise<unknown> {
    const config = this.configurationResolver.resolve(
      request.provider,
      request.model,
    );

    const provider = this.providerResolver.resolve(config.provider);

    if (!provider) {
      throw new NotFoundException(
        `Provider '${config.provider}' is not registered.`,
      );
    }

    return provider.completion({
      ...request,
      model: config.model,
    });
  }

  async embedding(request: EmbeddingRequestDto): Promise<unknown> {
    const config = this.configurationResolver.resolve(
      request.provider,
      request.model,
    );

    const provider = this.providerResolver.resolve(config.provider);

    if (!provider) {
      throw new NotFoundException(
        `Provider '${config.provider}' is not registered.`,
      );
    }

    return provider.embedding({
      ...request,
      model: config.model,
    });
  }
}
