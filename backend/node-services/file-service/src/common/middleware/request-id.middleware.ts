import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { validate as isUuid, v4 as uuid } from 'uuid';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(request: Request, response: Response, next: NextFunction): void {
    let requestId = request.headers['x-request-id'];

    if (!requestId) {
      requestId = uuid();
      request.headers['x-request-id'] = requestId;
    } else {
      if (typeof requestId !== 'string' || !isUuid(requestId)) {
        throw new BadRequestException('x-request-id must be a valid UUID.');
      }
    }

    response.setHeader('x-request-id', requestId);

    next();
  }
}
