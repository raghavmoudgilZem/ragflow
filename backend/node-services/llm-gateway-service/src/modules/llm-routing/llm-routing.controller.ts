import { Body, Controller, Post } from '@nestjs/common';
import { CompletionRequestDto } from './dto/completion-request.dto';
import { EmbeddingRequestDto } from './dto/embedding-request.dto';
import { LlmRoutingService } from './llm-routing.service';

@Controller({
  path: 'llm',
  version: '1',
})
export class LlmRoutingController {
  constructor(private readonly llmRoutingService: LlmRoutingService) {}

  @Post('completions')
  async completion(@Body() request: CompletionRequestDto): Promise<unknown> {
    return this.llmRoutingService.completion(request);
  }

  @Post('embeddings')
  async embedding(@Body() request: EmbeddingRequestDto): Promise<unknown> {
    return this.llmRoutingService.embedding(request);
  }
}
