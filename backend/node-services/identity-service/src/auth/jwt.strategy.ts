import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TenantRole, UserStatus } from '@prisma/client';

export type JwtPayload = {
  sub: string;
  email: string;
  status: UserStatus;
  activeTenantId?: string | null;
  tenantRole?: TenantRole | null;
  systemRole?: string | null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  validate(payload: JwtPayload) {
    // Immediate status check on token payload verification
    if (payload.status && payload.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('User account is inactive or banned');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      status: payload.status,
      activeTenantId: payload.activeTenantId ?? null,
      tenantRole: payload.tenantRole ?? null,
      systemRole: payload.systemRole ?? null,
      role: payload.tenantRole ?? payload.systemRole ?? null,
    };
  }
}