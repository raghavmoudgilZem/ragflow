import type { Request } from 'express';
import { UsersService } from './users.service';
type AuthRequest = Request & {
    user?: {
        userId?: string;
        email?: string;
        role?: string;
    };
};
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getMe(req: AuthRequest): Promise<{
        data: {
            id: string;
            email: string;
            createdAt: Date;
            updatedAt: Date;
            tenants: {
                tenantId: string;
                role: import("@prisma/client").$Enums.TenantRole;
                tenantName: string;
            }[];
        };
    }>;
}
export {};
