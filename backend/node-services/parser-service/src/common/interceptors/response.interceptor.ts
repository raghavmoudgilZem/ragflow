import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Response } from 'express';
import { map, Observable } from 'rxjs';
import type { ApiSuccessResponse } from 'common/types';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') return next.handle();

    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((data): ApiSuccessResponse<unknown> => ({
        success: true,
        status_code: response.statusCode,
        data,
      })),
    );
  }
}
