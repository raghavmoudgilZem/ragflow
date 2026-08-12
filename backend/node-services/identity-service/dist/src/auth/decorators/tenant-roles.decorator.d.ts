import { TenantRole } from '../enums/tenant-role.enum';
export declare const TENANT_ROLES_KEY = "tenant_roles";
export declare const TenantRoles: (...roles: TenantRole[]) => import("@nestjs/common").CustomDecorator<string>;
