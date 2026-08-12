import { SetMetadata } from '@nestjs/common';
import { TenantRole } from '../enums/tenant-role.enum';

export const TENANT_ROLES_KEY = 'tenant_roles';
export const TenantRoles = (...roles: TenantRole[]) =>
  SetMetadata(TENANT_ROLES_KEY, roles);
