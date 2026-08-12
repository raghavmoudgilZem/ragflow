import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import type { LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

const PORT = process.env.PORT ?? 7005;

async function bootstrap() {
  // Buffer until the winston logger is available, so the framework's own
  // bootstrap lines land in the log files too instead of only on stdout.
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get<LoggerService>(WINSTON_MODULE_NEST_PROVIDER));
  app.flushLogs();

  const logger = new Logger('Bootstrap');
  const configService = app.get(ConfigService);

  const rabbitMqUrl = configService.get<string>('rabbitmq.url');
  if (!rabbitMqUrl) {
    throw new Error('RABBIT_MQ_URL environment variable is not set');
  }

  const documentCreatedQueue = configService.get<string>(
    'rabbitmq.queue.documentCreated',
  );

  // document-created consumer microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitMqUrl],
      queue: documentCreatedQueue,
      queueOptions: { durable: true },
    },
  });

  await app.startAllMicroservices();
  // The broker URL is deliberately not logged: it carries the credentials.
  logger.log({
    message: 'RabbitMQ consumer started',
    queue: documentCreatedQueue,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  // Flushes winston and closes the Prisma/RMQ connections on SIGTERM.
  app.enableShutdownHooks();

  await app.listen(PORT);
  logger.log({
    message: 'Parser service started',
    port: PORT,
    healthEndpoint: '/api/health',
  });
}

bootstrap().catch((error: unknown) => {
  // The Nest logger may not exist yet at this point, so write to stderr
  // directly rather than lose the reason the process refused to start.
  console.error('Failed to bootstrap parser-service', error);
  process.exit(1);
});
