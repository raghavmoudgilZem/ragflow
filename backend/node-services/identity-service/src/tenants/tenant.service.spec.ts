import { Test, TestingModule } from '@nestjs/testing';
import { TenantService } from './tenant.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { TenantRole } from '@prisma/client';

describe('TenantService', () => {
  let service: TenantService;
  let prisma: PrismaService;

  // Mock PrismaService using exact schema model name: userTenant
  const mockPrismaService = {
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
    tenant: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    userTenant: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TenantService>(TenantService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

 describe('createTenant', () => {
    it('should create a tenant inside a transaction', async () => {
      const userId = 'creator-user-id';
      const tenantData = { name: 'Zem Corp', slug: 'zem-corp' };

      const mockCreatedTenant = {
        id: 'tenant-123',
        name: 'Zem Corp',
        slug: 'zem-corp',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.tenant.create.mockResolvedValue(mockCreatedTenant);
      mockPrismaService.userTenant.create.mockResolvedValue({
        tenantId: mockCreatedTenant.id,
        userId,
        role: TenantRole.ADMIN,
      });

      const result = await service.createTenant(userId, tenantData as any);

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.tenant.create).toHaveBeenCalled();
      
      // Check that the returned object contains the expected tenant fields & role
      expect(result).toMatchObject({
        id: 'tenant-123',
        name: 'Zem Corp',
        role: 'OWNER',
      });
    });
  });
  describe('addUserToTenant', () => {
    const tenantId = 'tenant-123';
    const memberEmail = 'member@example.com';
    const memberUserId = 'member-user-id';

    it('should throw NotFoundException if user to add does not exist', async () => {
      mockPrismaService.tenant.findUnique.mockResolvedValue({ id: tenantId });
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.addUserToTenant(tenantId, { email: memberEmail, role: TenantRole.MEMBER } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should successfully add user to tenant', async () => {
      // 1. Mock Tenant Exists
      mockPrismaService.tenant.findUnique.mockResolvedValue({ id: tenantId });
      // 2. Mock User Exists
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: memberUserId,
        email: memberEmail,
      });
      // 3. Mock No Existing Membership
      mockPrismaService.userTenant.findUnique.mockResolvedValue(null);
      // 4. Mock Successful Relation Creation
      mockPrismaService.userTenant.create.mockResolvedValue({
        tenantId,
        userId: memberUserId,
        role: TenantRole.MEMBER,
      });

      const result = await service.addUserToTenant(tenantId, {
        email: memberEmail,
        role: TenantRole.MEMBER,
      } as any);

      expect(prisma.userTenant.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('updateUserRole', () => {
    it('should update user role inside tenant', async () => {
      const tenantId = 'tenant-123';
      const userId = 'member-user-id';
      const newRole = TenantRole.ADMIN;

      // Detect service method name dynamically
      const updateFn =
        service.updateUserRole ||
        (service as any).updateRole ||
        (service as any).updateMemberRole ||
        (service as any).updateTenantUserRole;

      mockPrismaService.userTenant.findUnique?.mockResolvedValue({
        tenantId,
        userId,
        role: TenantRole.MEMBER,
      });
      mockPrismaService.userTenant.update.mockResolvedValue({
        tenantId,
        userId,
        role: newRole,
      });

      const result = await updateFn.call(service, tenantId, userId, newRole);

      expect(prisma.userTenant.update).toHaveBeenCalled();
      expect(result.role).toBe(newRole);
    });
  });

  describe('removeUserFromTenant', () => {
    it('should remove user from tenant', async () => {
      const tenantId = 'tenant-123';
      const userId = 'member-user-id';

      // 1. Mock Membership Record Exists
      mockPrismaService.userTenant.findUnique.mockResolvedValue({
        tenantId,
        userId,
        role: TenantRole.MEMBER,
      });
      // 2. Mock Deletion
      mockPrismaService.userTenant.delete.mockResolvedValue({
        tenantId,
        userId,
      });

      const result = await service.removeUserFromTenant(tenantId, userId);

      expect(prisma.userTenant.delete).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });
});