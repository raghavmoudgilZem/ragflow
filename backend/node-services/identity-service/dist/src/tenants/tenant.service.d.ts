import { PrismaService } from '../prisma/prisma.service';
import { TenantRole } from '../auth/enums/tenant-role.enum';
import { InviteTenantUserDto } from './dto/invite-tenant-user.dto';
export declare class TenantService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createTenant(userId: string, name: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        role: TenantRole;
    }>;
    addUserToTenant(tenantId: string, inviteDto: InviteTenantUserDto): Promise<{
        id: string;
        userId: string;
        tenantId: string;
        role: import("@prisma/client").$Enums.TenantRole;
    }>;
    updateTenantUserRole(tenantId: string, targetUserId: string, newRole: TenantRole): Promise<{
        id: string;
        userId: string;
        tenantId: string;
        role: import("@prisma/client").$Enums.TenantRole;
    }>;
    removeUserFromTenant(tenantId: string, targetUserId: string): Promise<{
        message: string;
        tenantId: string;
        userId: string;
    }>;
}
