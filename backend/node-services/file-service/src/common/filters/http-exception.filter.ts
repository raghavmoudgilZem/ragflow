import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponseDto } from '../dto/api-response.dto';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();

    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal Server Error';

    let error: unknown = exceptionResponse;

    if (typeof exceptionResponse === 'string') {
      error = {
        message: exceptionResponse,
      };
    }

    const apiResponse: ApiResponseDto<null> = {
      success: false,
      status_code: status,
      error,
      data: null,
    };

    response.status(status).json(apiResponse);
  }
}
