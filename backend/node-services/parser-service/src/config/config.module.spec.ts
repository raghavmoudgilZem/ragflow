import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ConfigurationModule } from './config.module';

describe('ConfigurationModule', () => {
  const originalEnv = process.env;
  let module: TestingModule;

  beforeAll(async () => {
    process.env = {
      ...originalEnv,
      RABBIT_MQ_URL: 'amqp://localhost:5672',
      RABBIT_MQ_QUEUE: 'test_queue',
    };

    module = await Test.createTestingModule({
      imports: [ConfigurationModule],
    }).compile();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should compile the module', () => {
    expect(module).toBeDefined();
  });

  it('should expose the rabbitmq config via ConfigService', () => {
    const configService = module.get(ConfigService);

    expect(configService.get('rabbitmq.url')).toBe('amqp://localhost:5672');
    expect(configService.get('rabbitmq.queue.documentCreated')).toBe(
      'document-created',
    );
  });
});
