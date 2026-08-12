import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getCurrentUserProfile(userId: string): Promise<{
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        tenants: {
            tenantId: string;
            role: import("@prisma/client").$Enums.TenantRole;
            tenantName: string;
        }[];
    }>;
}
