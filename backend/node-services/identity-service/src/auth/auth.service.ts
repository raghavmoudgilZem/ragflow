import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import * as bcrypt from 'bcrypt';
import { TenantRole, UserStatus } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) { }

  async register(email: string, pass: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(pass, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        status: UserStatus.ACTIVE,
      },
    });

    return { message: 'User registered successfully', userId: user.id };
  }

  async login(email: string, pass: string, activeTenantId?: string | null) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { tenants: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 1. Account Status Check (US-03)
    if (user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException(
        `Your account status is ${user.status.toLowerCase()}. Access denied.`,
      );
    }

    // 2. Password Verification
    const isPasswordValid = await bcrypt.compare(pass, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 3. Active Tenant Context Resolution
    let selectedTenant: { tenantId: string; role: TenantRole } | null = null;
    if (activeTenantId) {
      selectedTenant =
        user.tenants?.find((ut) => ut.tenantId === activeTenantId) ?? null;

      if (!selectedTenant) {
        throw new UnauthorizedException(
          'User does not belong to the active tenant context',
        );
      }
    }

    // 4. Update Audit Metadata: lastLoginAt (US-05)
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // 5. Build JWT Payload with Role & Status Claims (US-03)
    const payload = this.buildJwtPayload(
      user.id,
      user.email,
      user.status,
      selectedTenant?.tenantId ?? null,
      selectedTenant?.role ?? null,
    );

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    await this.redisService.setRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }
  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      const storedToken = await this.redisService.getRefreshToken(userId);
      if (!storedToken || storedToken !== token) {
        throw new UnauthorizedException('Invalid or revoked refresh token');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { tenants: true },
      });

      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new ForbiddenException('User account is inactive or banned');
      }

      let selectedTenant: { tenantId: string; role: TenantRole } | null = null;
      if (payload.activeTenantId) {
        selectedTenant =
          user.tenants?.find((ut) => ut.tenantId === payload.activeTenantId) ?? null;
      }

      const newPayload = this.buildJwtPayload(
        user.id,
        user.email,
        user.status,
        selectedTenant?.tenantId ?? null,
        selectedTenant?.role ?? null,
      );

      const accessToken = this.jwtService.sign(newPayload);
      const newRefreshToken = this.jwtService.sign(newPayload, {
        expiresIn: '7d',
      });

      await this.redisService.setRefreshToken(user.id, newRefreshToken);

      return { accessToken, refreshToken: newRefreshToken };
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }


  async logout(userId: string) {
    await this.redisService.deleteRefreshToken(userId); return { message: 'Logged out successfully' };
  }

  private buildJwtPayload(
    userId: string,
    email: string,
    status: UserStatus,
    activeTenantId: string | null = null,
    tenantRole: TenantRole | null = null,
    systemRole: string | null = null,
  ) {
    return {
      sub: userId,
      email,
      status,
      activeTenantId,
      tenantRole,
      systemRole,
    };
  }
}
