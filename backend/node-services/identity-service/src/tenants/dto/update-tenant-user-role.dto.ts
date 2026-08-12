import { IsEnum } from 'class-validator';
import { TenantRole } from '../../auth/enums/tenant-role.enum';

export class UpdateTenantUserRoleDto {
  @IsEnum(TenantRole, { message: 'Role must be one of OWNER, ADMIN, MEMBER' })
  role!: TenantRole;
}
