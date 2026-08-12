import { TenantRole } from '../../auth/enums/tenant-role.enum';
export declare class InviteTenantUserDto {
    email?: string;
    userId?: string;
    role?: TenantRole;
}
