import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantRole } from '../enums/tenant-role.enum';
import { TENANT_ROLES_KEY } from '../decorators/tenant-roles.decorator';

export interface AuthenticatedRequest {
  user?: {
    userId?: string;
    email?: string;
    activeTenantId?: string | null;
    role?: string | null;
  };
  tenantContext?: {
    tenantId: string;
    role: TenantRole;
  };
  params: Record<string, string>;
}

@Injectable()
export class TenantRolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<TenantRole[]>(
      TENANT_ROLES_KEY,
      context.getHandler(),
    );

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user?.userId) {
      throw new UnauthorizedException();
    }

    const tenantId = request.params?.tenantId;
    if (!tenantId) {
      throw new BadRequestException('tenantId route parameter is required');
    }

    const membership = await this.prisma.userTenant.findUnique({
      where: {
        userId_tenantId: {
          userId: user.userId,
          tenantId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException(
        'You are not a member of the requested tenant workspace.',
      );
    }

    const userRole = membership.role as TenantRole;
    if (requiredRoles && requiredRoles.length > 0) {
      if (!requiredRoles.includes(userRole)) {
        throw new ForbiddenException(
          'Insufficient tenant role for this operation.',
        );
      }
    }

    request.tenantContext = {
      tenantId,
      role: userRole,
    };

    return true;
  }
}
