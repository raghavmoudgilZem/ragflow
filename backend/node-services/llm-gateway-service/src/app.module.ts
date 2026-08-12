import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LlmModule } from './modules/llm/llm.module';
import { PrismaModule } from './infrastructure/database/prisma.module';
import { AppConfigModule } from './config/config.module';
import { LlmFactoryModule } from './modules/llm-factory/llm-factory.module';
import { HealthModule } from './health/health.module';
import { ProvidersModule } from './providers/providers.module';
import { LlmRoutingModule } from './modules/llm-routing/llm-routing.module';

@Module({
  imports: [
    LlmModule,
    AppConfigModule,
    PrismaModule,
    LlmFactoryModule,
    HealthModule,
    ProvidersModule,
    LlmRoutingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
