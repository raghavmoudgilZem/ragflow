import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SearchModule } from './modules/search/search.module';
import { ExecutionModule } from './modules/search-execution/execution.module';
import { HealthModule } from './modules/health/health.module';
import { ConfigModule } from '@nestjs/config';
import { GlobalHttpModule } from './core/global-http/global-http.module';
import { IdentityModule } from './integration/identity-client/identity.module';
import { DatasetModule } from './integration/dataset-client/dataset.module';
import { LlmModule } from './integration/llm-client/llm.module';

@Module({
  imports: [
    SearchModule,
    ExecutionModule,
    HealthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GlobalHttpModule,
    IdentityModule,
    DatasetModule,
    LlmModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
