import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { PrismaService } from '../../prisma.service';
import {
  BadRequestException,
  ForbiddenException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { User } from '../../common/decorators/user.decorator';

describe('SearchService', () => {
  let service: SearchService;
  let prisma: PrismaService;

  // Mock data helpers
  const mockUserId = 'user-123';
  const mockTenantId = 'tenant-789';
  const mockConfigId = 'config-abc';

  // Default mock user object mapping standard permissions
  const mockUser: User = {
    userId: mockUserId,
    tenantId: mockTenantId,
    roles: ['User'],
  };

  // FIXED: Changed keys to snake_case to perfectly match what the service file expects from Prisma
  const mockSearchConfig = {
    id: mockConfigId,
    name: 'Test Search',
    user_id: mockUserId,
    tenant_id: mockTenantId,
    search_config: {},
    created_at: new Date(),
    updated_at: new Date(),
  };

  // Deep mock setup for Prisma
  const mockPrismaService = {
    searchConfiguration: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
    prisma = module.get<PrismaService>(PrismaService);

    // STUB THE LOGGER: This stops all internal framework and service console log pollution
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => jest.fn());
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => jest.fn());
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => jest.fn());

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a search configuration', async () => {
      const dto = { name: 'New Config' };
      mockPrismaService.searchConfiguration.create.mockResolvedValue(
        mockSearchConfig,
      );

      const result = await service.create(mockUserId, mockTenantId, dto as any);

      expect(prisma.searchConfiguration.create).toHaveBeenCalledWith({
        data: {
          name: dto.name,
          user_id: mockUserId, // FIXED: was userId
          tenant_id: mockTenantId, // FIXED: was tenantId
          search_config: {},
        },
      });
      expect(result).toEqual(mockSearchConfig);
    });

    it('should handle optional tenantId by saving it as a null value', async () => {
      const dto = { name: 'New Config' };
      mockPrismaService.searchConfiguration.create.mockResolvedValue(
        mockSearchConfig,
      );

      await service.create(mockUserId, undefined, dto as any);

      expect(prisma.searchConfiguration.create).toHaveBeenCalledWith({
        data: {
          name: 'New Config',
          user_id: mockUserId, // FIXED: was userId
          tenant_id: null, // FIXED: was tenantId
          search_config: {},
        },
      });
    });

    it('should throw BadRequestException if database insertion fails', async () => {
      mockPrismaService.searchConfiguration.create.mockRejectedValue(
        new Error('DB Error'),
      );

      await expect(
        service.create(mockUserId, mockTenantId, { name: 'X' } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return config if tenant and user match perfectly', async () => {
      mockPrismaService.searchConfiguration.findUnique.mockResolvedValue(
        mockSearchConfig,
      );

      const result = await service.findOne(mockConfigId, mockUser);
      expect(result).toEqual(mockSearchConfig);
    });

    it('should throw NotFoundException if config does not exist', async () => {
      mockPrismaService.searchConfiguration.findUnique.mockResolvedValue(null);

      await expect(service.findOne('invalid-id', mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if tenantId does not match', async () => {
      mockPrismaService.searchConfiguration.findUnique.mockResolvedValue(
        mockSearchConfig,
      );

      const badTenantUser: User = { ...mockUser, tenantId: 'wrong-tenant' };

      await expect(
        service.findOne(mockConfigId, badTenantUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if user is not the creator', async () => {
      mockPrismaService.searchConfiguration.findUnique.mockResolvedValue(
        mockSearchConfig,
      );

      const badUser: User = { ...mockUser, userId: 'wrong-user' };

      await expect(service.findOne(mockConfigId, badUser)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should bypass user ownership check if user has Admin role', async () => {
      mockPrismaService.searchConfiguration.findUnique.mockResolvedValue(
        mockSearchConfig,
      );

      const adminUser: User = {
        ...mockUser,
        userId: 'wrong-user',
        roles: ['Admin'],
      };

      const result = await service.findOne(mockConfigId, adminUser);
      expect(result).toEqual(mockSearchConfig);
    });

    it('should bypass user ownership check if user has Owner role', async () => {
      mockPrismaService.searchConfiguration.findUnique.mockResolvedValue(
        mockSearchConfig,
      );

      const ownerUser: User = {
        ...mockUser,
        userId: 'wrong-user',
        roles: ['Owner'],
      };

      const result = await service.findOne(mockConfigId, ownerUser);
      expect(result).toEqual(mockSearchConfig);
    });
  });

  describe('update', () => {
    it('should call prisma.update if ownership validation passes', async () => {
      const dto = { name: 'Updated Name' };
      mockPrismaService.searchConfiguration.findUnique.mockResolvedValue(
        mockSearchConfig,
      );
      mockPrismaService.searchConfiguration.update.mockResolvedValue({
        ...mockSearchConfig,
        ...dto,
      });

      const result = await service.update(mockConfigId, mockUser, dto as any);

      expect(prisma.searchConfiguration.update).toHaveBeenCalledWith({
        where: { id: mockConfigId },
        data: expect.objectContaining({ name: 'Updated Name' }),
      });
      expect(result.name).toBe('Updated Name');
    });

    it('should correctly handle nested search_config database updates', async () => {
      const dto = {
        name: 'Complex Update',
        search_config: {
          similarity_threshold: 0.85,
          summary: 'Updated Summary',
        },
      };

      mockPrismaService.searchConfiguration.findUnique.mockResolvedValue(
        mockSearchConfig,
      );
      mockPrismaService.searchConfiguration.update.mockResolvedValue({
        ...mockSearchConfig,
        ...dto,
      });

      await service.update(mockConfigId, mockUser, dto as any);

      expect(prisma.searchConfiguration.update).toHaveBeenCalledWith({
        where: { id: mockConfigId },
        data: expect.objectContaining({
          name: 'Complex Update',
          search_config: expect.objectContaining({
            similarity_threshold: 0.85,
            summary: 'Updated Summary',
          }),
        }),
      });
    });

    it('should throw BadRequestException if update database execution fails', async () => {
      mockPrismaService.searchConfiguration.findUnique.mockResolvedValue(
        mockSearchConfig,
      );
      mockPrismaService.searchConfiguration.update.mockRejectedValue(
        new Error('Prisma mutation failed'),
      );

      await expect(
        service.update(mockConfigId, mockUser, { name: 'Failing Update' } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should delete configuration if validation passes', async () => {
      mockPrismaService.searchConfiguration.findUnique.mockResolvedValue(
        mockSearchConfig,
      );
      mockPrismaService.searchConfiguration.delete.mockResolvedValue(
        mockSearchConfig,
      );

      await service.remove(mockConfigId, mockUser);

      expect(prisma.searchConfiguration.delete).toHaveBeenCalledWith({
        where: { id: mockConfigId },
      });
    });
  });
});