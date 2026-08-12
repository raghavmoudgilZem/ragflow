import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';


const IGNORED_PATHS = new Set(['/api/health']);
type RoutedRequest = Omit<Request, 'route'> & { route?: { path?: string } };

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') return next.handle();

    const request = context.switchToHttp().getRequest<RoutedRequest>();
    if (IGNORED_PATHS.has(request.path)) return next.handle();

    const startedAt = Date.now();
    const base = {
      method: request.method,
      // The route pattern, not the resolved URL: no query strings reach the log.
      route: request.route?.path ?? request.path,
      handler: `${context.getClass().name}.${context.getHandler().name}`,
    };

    this.logger.debug({ message: 'Request received', ...base });

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse<Response>();
          this.logger.log({
            message: 'Request completed',
            ...base,
            statusCode: response.statusCode,
            durationMs: Date.now() - startedAt,
          });
        },
        error: (error: unknown) => {
          this.logger.warn({
            message: 'Request failed',
            ...base,
            error: error instanceof Error ? error.name : 'UnknownError',
            durationMs: Date.now() - startedAt,
          });
        },
      }),
    );
  }
}
