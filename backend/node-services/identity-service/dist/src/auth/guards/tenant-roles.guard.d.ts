import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantRole } from '../enums/tenant-role.enum';
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
export declare class TenantRolesGuard implements CanActivate {
    private readonly reflector;
    private readonly prisma;
    constructor(reflector: Reflector, prisma: PrismaService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
