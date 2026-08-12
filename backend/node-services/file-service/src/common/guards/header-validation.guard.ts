import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { validate as isUuid } from 'uuid';

@Injectable()
export class HeaderValidationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    //skipping for health check API
    const request = context.switchToHttp().getRequest<Request>();
    if (request.path === '/api/v1/health') {
      return true;
    }

    const tenantId = request.headers['x-tenant-id'];
    const userId = request.headers['x-user-id'];

    if (!tenantId || typeof tenantId !== 'string') {
      throw new BadRequestException('x-tenant-id header is required.');
    }

    if (!isUuid(tenantId)) {
      throw new BadRequestException('x-tenant-id must be a valid UUID.');
    }

    if (userId !== undefined) {
      if (typeof userId !== 'string' || !isUuid(userId)) {
        throw new BadRequestException('x-user-id must be a valid UUID.');
      }
    }

    return true;
  }
}
