import { Module } from '@nestjs/common';
import { ProvidersModule } from '../../providers/providers.module';
import { LlmRoutingController } from './llm-routing.controller';
import { LlmRoutingService } from './llm-routing.service';
import { LlmConfigurationResolverService } from './services/llm-configuration-resolver.service';

@Module({
  imports: [ProvidersModule],
  controllers: [LlmRoutingController],
  providers: [LlmRoutingService, LlmConfigurationResolverService],
})
export class LlmRoutingModule {}
