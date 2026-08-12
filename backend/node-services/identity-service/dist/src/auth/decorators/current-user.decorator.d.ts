import { TenantRole } from '../enums/tenant-role.enum';
export type AuthenticatedUser = {
    userId: string;
    email: string;
    activeTenantId?: string | null;
    tenantRole?: TenantRole | null;
    systemRole?: string | null;
    role?: string | null;
};
export declare const CurrentUser: (...dataOrPipes: unknown[]) => ParameterDecorator;
