import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigurationModule } from './config/config.module';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';
import { PrismaModule } from 'prisma/prisma.module';
import { ParseJobModule } from 'parse-job/parse-job.module';
import { winstonConfig } from 'config/winston.config';
import { GlobalExceptionFilter } from 'common/filters/globalException.filter';
import { LoggingInterceptor } from 'common/interceptors/logging.interceptor';
import { ResponseInterceptor } from 'common/interceptors/response.interceptor';
import { CorrelationIdMiddleware } from 'common/middleware/correlationId.middleware';

@Module({
  imports: [
    // forRoot (rather than createLogger in main.ts) so the logger is also
    // injectable and one winston instance serves the whole app.
    WinstonModule.forRoot(winstonConfig),
    ConfigurationModule,
    RabbitMQModule,
    PrismaModule,
    ParseJobModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Registered here rather than in main.ts so both get dependency injection.
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
