import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppModule', () => {
  const originalEnv = process.env;
  let module: TestingModule;

  beforeAll(async () => {
    process.env = {
      ...originalEnv,
      RABBIT_MQ_URL: 'amqp://localhost:5672',
      RABBIT_MQ_QUEUE: 'test_queue',
    };

    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should compile the module', () => {
    expect(module).toBeDefined();
  });

  it('should resolve AppController', () => {
    expect(module.get(AppController)).toBeInstanceOf(AppController);
  });

  it('should resolve AppService', () => {
    expect(module.get(AppService)).toBeInstanceOf(AppService);
  });
});
