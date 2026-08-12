import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TenantRole } from '../enums/tenant-role.enum';

export type AuthenticatedUser = {
  userId: string;
  email: string;
  activeTenantId?: string | null;
  tenantRole?: TenantRole | null;
  systemRole?: string | null;
  role?: string | null;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const req = ctx.switchToHttp().getRequest();
    return req.user;
  },
);