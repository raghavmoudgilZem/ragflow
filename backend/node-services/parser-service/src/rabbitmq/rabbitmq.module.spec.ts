import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { RabbitMQModule, RABBITMQ_CLIENT } from './rabbitmq.module';
import rabbitmqConfig from '../config/rabbitmq.config';

describe('RabbitMQModule', () => {
  const originalEnv = process.env;
  let module: TestingModule;

  beforeAll(async () => {
    process.env = {
      ...originalEnv,
      RABBIT_MQ_URL: 'amqp://localhost:5672',
      RABBIT_MQ_QUEUE: 'test_queue',
    };

    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, load: [rabbitmqConfig] }),
        RabbitMQModule,
      ],
    }).compile();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should compile the module', () => {
    expect(module).toBeDefined();
  });

  it('should provide the RabbitMQ client', () => {
    const client = module.get<ClientProxy>(RABBITMQ_CLIENT);
    expect(client).toBeDefined();
  });
});
