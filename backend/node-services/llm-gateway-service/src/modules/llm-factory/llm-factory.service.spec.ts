import { Test, TestingModule } from '@nestjs/testing';
import { LlmFactoryService } from './llm-factory.service';

describe('LlmFactoryService', () => {
  let service: LlmFactoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LlmFactoryService],
    }).compile();

    service = module.get<LlmFactoryService>(LlmFactoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
