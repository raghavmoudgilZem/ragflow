// src/tenants/dto/invite-tenant-user.dto.ts
import { IsEmail, IsOptional, IsUUID, ValidateIf, IsEnum } from 'class-validator';
import { TenantRole } from '../../auth/enums/tenant-role.enum';

export class InviteTenantUserDto {
  @ValidateIf((o) => !o.userId)
  @IsEmail({}, { message: 'You must provide a valid user email or userId' })
  @IsOptional()
  email?: string;

  @ValidateIf((o) => !o.email)
  @IsUUID('4', { message: 'You must provide a valid userId or email' })
  @IsOptional()
  userId?: string;

  @IsOptional()
  @IsEnum(TenantRole, { message: 'role must be a valid TenantRole' })
  role?: TenantRole;
}