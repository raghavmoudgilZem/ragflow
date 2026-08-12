import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly redisService;
    constructor(prisma: PrismaService, jwtService: JwtService, redisService: RedisService);
    register(email: string, pass: string): Promise<{
        message: string;
        userId: string;
    }>;
    login(email: string, pass: string, activeTenantId?: string | null): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    refreshToken(token: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: string): Promise<{
        message: string;
    }>;
    private buildJwtPayload;
}
