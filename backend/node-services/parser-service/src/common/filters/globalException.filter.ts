import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { throwError } from 'rxjs';
import type { ApiErrorResponse } from 'common/types';

type RoutedRequest = Omit<Request, 'route'> & { route?: { path?: string } };

function extractMessage(payload: string | object): string {
  if (typeof payload === 'string') return payload;

  const { message } = payload as { message?: unknown };

  if (typeof message === 'string') return message;
  if (Array.isArray(message)) return message.join(', ');

  return 'Internal server error';
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    if (host.getType() !== 'http') {
      this.logger.error(
        { message: 'Unhandled exception outside HTTP context' },
        exception instanceof Error ? exception.stack : String(exception),
      );
      return throwError(() => exception);
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<RoutedRequest>();

    let message = 'Internal server error';
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      message = extractMessage(exception.getResponse());
    }

    const meta = {
      method: request?.method,
      route: request?.route?.path ?? request?.path,
      statusCode,
      errorName: exception instanceof Error ? exception.name : 'UnknownError',
    };

    // Status >= 500 
    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        { message: 'Request failed with a server error', ...meta },
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn({
        message: 'Request rejected',
        ...meta,
        reason: message,
      });
    }

    const body: ApiErrorResponse = {
      success: false,
      status_code: statusCode,
      error: message,
    };
    response.status(statusCode).json(body);
  }
}
