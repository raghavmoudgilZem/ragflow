import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    tenantId?: string; // Made optional to support users without a tenant
    roles: string[];
  };
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Ensure we are handling an HTTP execution context
    if (context.getType() !== 'http') {
      return false; // Reject execution contexts that aren't HTTP (e.g., WebSockets, RPC) if not supported
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    let token: string | undefined;
    const authHeader = request.headers.authorization;

    // 2. Extract token from Header or Query parameters
    if (authHeader) {
      const [scheme, credentials] = authHeader.split(' ');
      if (scheme === 'Bearer' && credentials) {
        token = credentials;
      }
    } else if (request.query && typeof request.query.token === 'string') {
      token = request.query.token;
    }

    if (!token) {
      throw new UnauthorizedException('No authorization token found');
    }

    try {
      const secret = this.configService.get<string>('JWT_SECRET');
      const issuer = this.configService.get<string>('JWT_ISSUER');
      const audience = this.configService.get<string>('JWT_AUDIENCE');

      if (!secret) {
        throw new Error('JWT_SECRET configuration is missing on the server');
      }

      const decoded = jwt.verify(token, secret, {
        issuer,
        audience,
      }) as any;

      const roleClaimKey =
        'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
      const rawRoles = decoded[roleClaimKey];
      request.user = {
        userId: decoded.sub,
        tenantId: decoded.tenantId || undefined, // Safely maps your string tenantId
        // Handles both a single string (like "Owner") or an array of roles cleanly
        roles: Array.isArray(rawRoles) ? rawRoles : rawRoles ? [rawRoles] : [],
      };

      return true;
    } catch (error) {
      this.throwCustomException(error);
      return false;
    }
  }

  private throwCustomException(error: any) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedException('Token has expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedException('Invalid token');
    }
    throw new UnauthorizedException('Authentication failed');
  }
}
