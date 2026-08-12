import { Test, TestingModule } from '@nestjs/testing';
import { LlmRoutingController } from './llm-routing.controller';
import { LlmRoutingService } from './llm-routing.service';

describe('LlmRoutingController', () => {
  let controller: LlmRoutingController;

  const mockLlmRoutingService = {
    completion: jest.fn(),
    embedding: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LlmRoutingController],
      providers: [
        {
          provide: LlmRoutingService,
          useValue: mockLlmRoutingService,
        },
      ],
    }).compile();

    controller = module.get<LlmRoutingController>(LlmRoutingController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('completion', () => {
    it('should delegate completion request to the service', async () => {
      const request = {
        provider: 'openai',
        model: 'gpt-4',
        messages: [],
      };

      const response = { result: 'success' };

      mockLlmRoutingService.completion.mockResolvedValue(response);

      await expect(controller.completion(request)).resolves.toEqual(response);

      expect(mockLlmRoutingService.completion).toHaveBeenCalledWith(request);
    });
  });

  describe('embedding', () => {
    it('should delegate embedding request to the service', async () => {
      const request = {
        provider: 'openai',
        model: 'text-embedding-3-small',
        input: 'hello',
      };

      const response = { embedding: [1, 2, 3] };

      mockLlmRoutingService.embedding.mockResolvedValue(response);

      await expect(controller.embedding(request)).resolves.toEqual(response);

      expect(mockLlmRoutingService.embedding).toHaveBeenCalledWith(request);
    });
  });
});
