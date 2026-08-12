import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { LlmRoutingService } from './llm-routing.service';
import { ProviderResolver } from '../../providers/provider.resolver';
import { LlmConfigurationResolverService } from './services/llm-configuration-resolver.service';

describe('LlmRoutingService', () => {
  let service: LlmRoutingService;

  const mockProvider = {
    completion: jest.fn(),
    embedding: jest.fn(),
  };

  const mockProviderResolver = {
    resolve: jest.fn(),
  };

  const mockConfigurationResolver = {
    resolve: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LlmRoutingService,
        {
          provide: ProviderResolver,
          useValue: mockProviderResolver,
        },
        {
          provide: LlmConfigurationResolverService,
          useValue: mockConfigurationResolver,
        },
      ],
    }).compile();

    service = module.get<LlmRoutingService>(LlmRoutingService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('completion', () => {
    it('should delegate completion request to resolved provider', async () => {
      const request = {
        provider: 'openai',
        model: 'gpt-4',
        messages: [],
      };

      const response = { result: 'success' };

      mockConfigurationResolver.resolve.mockReturnValue({
        provider: 'openai',
        model: 'gpt-4',
      });

      mockProviderResolver.resolve.mockReturnValue(mockProvider);
      mockProvider.completion.mockResolvedValue(response);

      await expect(service.completion(request)).resolves.toEqual(response);

      expect(mockConfigurationResolver.resolve).toHaveBeenCalledWith(
        'openai',
        'gpt-4',
      );
      expect(mockProviderResolver.resolve).toHaveBeenCalledWith('openai');
      expect(mockProvider.completion).toHaveBeenCalledWith(request);
    });

    it('should throw NotFoundException when provider is not registered', async () => {
      mockConfigurationResolver.resolve.mockReturnValue({
        provider: 'unknown',
        model: 'gpt-4',
      });

      mockProviderResolver.resolve.mockReturnValue(undefined);

      await expect(
        service.completion({
          provider: 'unknown',
          model: 'gpt-4',
          messages: [],
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('embedding', () => {
    it('should delegate embedding request to resolved provider', async () => {
      const request = {
        provider: 'openai',
        model: 'text-embedding-3-small',
        input: 'hello',
      };

      const response = { embedding: [1, 2, 3] };

      mockConfigurationResolver.resolve.mockReturnValue({
        provider: 'openai',
        model: 'text-embedding-3-small',
      });

      mockProviderResolver.resolve.mockReturnValue(mockProvider);
      mockProvider.embedding.mockResolvedValue(response);

      await expect(service.embedding(request)).resolves.toEqual(response);

      expect(mockConfigurationResolver.resolve).toHaveBeenCalledWith(
        'openai',
        'text-embedding-3-small',
      );
      expect(mockProviderResolver.resolve).toHaveBeenCalledWith('openai');
      expect(mockProvider.embedding).toHaveBeenCalledWith(request);
    });

    it('should throw NotFoundException when provider is not registered', async () => {
      mockConfigurationResolver.resolve.mockReturnValue({
        provider: 'unknown',
        model: 'text-embedding-3-small',
      });

      mockProviderResolver.resolve.mockReturnValue(undefined);

      await expect(
        service.embedding({
          provider: 'unknown',
          model: 'text-embedding-3-small',
          input: 'hello',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
