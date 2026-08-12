import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface User {
  userId: string;
  tenantId: string;
  roles: string[];
}

export const User = createParamDecorator(
  (data: keyof User | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as User;

    if (!user) {
      return null;
    }

    // If data is provided, return that specific property of the user (e.g., 'userId' or 'tenantId')
    return data ? user[data] : user;
  },
);
