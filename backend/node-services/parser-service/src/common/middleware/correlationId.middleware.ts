import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { runWithRequestContext } from 'common/logging/request-context';
import { randomUUID } from 'node:crypto';

export const CORRELATION_ID_HEADER = 'x-correlation-id';
const REQUEST_ID_HEADER = 'x-request-id';

/**
 * Opens the ambient logging context for the lifetime of an HTTP request, so
 * every log line emitted downstream carries the same `correlationId`. An
 * upstream id is honoured when present so a trace survives service hops.
 */
@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const incoming =
      req.header(CORRELATION_ID_HEADER) ?? req.header(REQUEST_ID_HEADER);
    const correlationId = incoming?.trim() || randomUUID();

    res.setHeader(CORRELATION_ID_HEADER, correlationId);

    runWithRequestContext({ correlationId }, () => next());
  }
}
