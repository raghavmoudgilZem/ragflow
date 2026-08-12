import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantRole } from '../auth/enums/tenant-role.enum';
import { InviteTenantUserDto } from './dto/invite-tenant-user.dto';

@Injectable()
export class TenantService {
  constructor(private readonly prisma: PrismaService) { }

  async createTenant(userId: string, name: string) {
    const tenant = await this.prisma.$transaction(async (tx) => {
      const createdTenant = await tx.tenant.create({
        data: {
          name,
        },
      });

      await tx.userTenant.create({
        data: {
          userId,
          tenantId: createdTenant.id,
          role: TenantRole.OWNER,
        },
      });

      return createdTenant;
    });

    return {
      id: tenant.id,
      name: tenant.name,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
      role: TenantRole.OWNER,
    };
  }

  async addUserToTenant(tenantId: string, inviteDto: InviteTenantUserDto) {
    const user =
      inviteDto.userId && inviteDto.userId.trim().length > 0
        ? await this.prisma.user.findUnique({ where: { id: inviteDto.userId } })
        : await this.prisma.user.findUnique({ where: { email: inviteDto.email } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const existing = await this.prisma.userTenant.findUnique({
      where: {
        userId_tenantId: {
          userId: user.id,
          tenantId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('User is already a member of this tenant');
    }

    const role = inviteDto.role ?? TenantRole.MEMBER;

    const membership = await this.prisma.userTenant.create({
      data: {
        userId: user.id,
        tenantId,
        role,
      },
    });

    return {
      id: membership.id,
      userId: membership.userId,
      tenantId: membership.tenantId,
      role: membership.role,
    };
  }

  async updateTenantUserRole(
    tenantId: string,
    targetUserId: string,
    newRole: TenantRole,
  ) {
    const targetMembership = await this.prisma.userTenant.findUnique({
      where: {
        userId_tenantId: {
          userId: targetUserId,
          tenantId,
        },
      },
    });

    if (!targetMembership) {
      throw new NotFoundException('Target user is not a member of this tenant');
    }

    if (targetMembership.role === newRole) {
      return {
        id: targetMembership.id,
        userId: targetMembership.userId,
        tenantId: targetMembership.tenantId,
        role: targetMembership.role,
      };
    }

    if (targetMembership.role === TenantRole.OWNER && newRole !== TenantRole.OWNER) {
      const ownerCount = await this.prisma.userTenant.count({
        where: {
          tenantId,
          role: TenantRole.OWNER,
        },
      });

      if (ownerCount <= 1) {
        throw new BadRequestException(
          'Tenant must retain at least one OWNER. Role update blocked.',
        );
      }
    }

    const updatedMembership = await this.prisma.userTenant.update({
      where: {
        userId_tenantId: {
          userId: targetUserId,
          tenantId,
        },
      },
      data: {
        role: newRole,
      },
    });

    return {
      id: updatedMembership.id,
      userId: updatedMembership.userId,
      tenantId: updatedMembership.tenantId,
      role: updatedMembership.role,
    };
  }

  async removeUserFromTenant(tenantId: string, targetUserId: string) {
    const membership = await this.prisma.userTenant.findUnique({
      where: {
        userId_tenantId: {
          userId: targetUserId,
          tenantId,
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('User is not a member of this tenant');
    }

    if (membership.role === TenantRole.OWNER) {
      const [ownerCount] = await this.prisma.$transaction([
        this.prisma.userTenant.count({
          where: {
            tenantId,
            role: TenantRole.OWNER,
          },
        }),
      ]);

      if (ownerCount <= 1) {
        throw new BadRequestException(
          'Cannot remove the last OWNER from the tenant.',
        );
      }
    }

    await this.prisma.userTenant.delete({
      where: {
        userId_tenantId: {
          userId: targetUserId,
          tenantId,
        },
      },
    });

    return {
      message: 'User removed from tenant successfully',
      tenantId,
      userId: targetUserId,
    };
  }
}
