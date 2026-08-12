import {
  Logger,
  type CallHandler,
  type ExecutionContext,
} from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { LoggingInterceptor } from './logging.interceptor';

describe('LoggingInterceptor', () => {
  const interceptor = new LoggingInterceptor();
  const log = jest.spyOn(Logger.prototype, 'log').mockImplementation();
  const warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  jest.spyOn(Logger.prototype, 'debug').mockImplementation();

  const contextFor = (path: string, type = 'http'): ExecutionContext =>
    ({
      getType: () => type,
      getClass: () => ({ name: 'ParseJobHttpController' }),
      getHandler: () => ({ name: 'handleDocumentParse' }),
      switchToHttp: () => ({
        getRequest: () => ({ method: 'POST', path, route: { path } }),
        getResponse: () => ({ statusCode: 201 }),
      }),
    }) as unknown as ExecutionContext;

  const handlerOf = (source: CallHandler['handle']): CallHandler =>
    ({ handle: source }) as CallHandler;

  beforeEach(() => jest.clearAllMocks());

  it('logs the outcome and latency of a completed request', () => {
    interceptor
      .intercept(
        contextFor('/api/v1/parse'),
        handlerOf(() => of({ ok: true })),
      )
      .subscribe();

    expect(log).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Request completed',
        method: 'POST',
        route: '/api/v1/parse',
        statusCode: 201,
        durationMs: expect.any(Number),
      }),
    );
  });

  it('summarises a failure without duplicating the filter’s stack trace', () => {
    interceptor
      .intercept(
        contextFor('/api/v1/parse'),
        handlerOf(() => throwError(() => new TypeError('boom'))),
      )
      .subscribe({ error: () => undefined });

    expect(warn).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Request failed',
        error: 'TypeError',
      }),
    );
    expect(log).not.toHaveBeenCalled();
  });

  it('stays quiet for health probes', () => {
    interceptor
      .intercept(
        contextFor('/api/health'),
        handlerOf(() => of({ ok: true })),
      )
      .subscribe();

    expect(log).not.toHaveBeenCalled();
  });

  it('ignores non-HTTP contexts', () => {
    interceptor
      .intercept(
        contextFor('/irrelevant', 'rpc'),
        handlerOf(() => of({ ok: true })),
      )
      .subscribe();

    expect(log).not.toHaveBeenCalled();
  });
});
