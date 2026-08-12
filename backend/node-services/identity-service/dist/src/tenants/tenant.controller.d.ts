import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { InviteTenantUserDto } from './dto/invite-tenant-user.dto';
import { UpdateTenantUserRoleDto } from './dto/update-tenant-user-role.dto';
import { TenantRole } from '../auth/enums/tenant-role.enum';
import { type AuthenticatedUser } from '../auth/decorators/current-user.decorator';
export declare class TenantController {
    private readonly tenantService;
    constructor(tenantService: TenantService);
    createTenant(user: AuthenticatedUser, createTenantDto: CreateTenantDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        role: TenantRole;
    }>;
    inviteTenantUser(tenantId: string, inviteDto: InviteTenantUserDto): Promise<{
        id: string;
        userId: string;
        tenantId: string;
        role: import("@prisma/client").$Enums.TenantRole;
    }>;
    updateMemberRole(tenantId: string, targetUserId: string, updateDto: UpdateTenantUserRoleDto): Promise<{
        id: string;
        userId: string;
        tenantId: string;
        role: import("@prisma/client").$Enums.TenantRole;
    }>;
    removeTenantUser(tenantId: string, userId: string): Promise<{
        message: string;
        tenantId: string;
        userId: string;
    }>;
}
