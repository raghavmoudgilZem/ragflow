import { Test, TestingModule } from '@nestjs/testing';
import { LlmFactoryController } from './llm-factory.controller';

describe('LlmFactoryController', () => {
  let controller: LlmFactoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LlmFactoryController],
    }).compile();

    controller = module.get<LlmFactoryController>(LlmFactoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
