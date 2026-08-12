import type { NextFunction, Request, Response } from 'express';
import {
  CORRELATION_ID_HEADER,
  CorrelationIdMiddleware,
} from './correlationId.middleware';
import { getRequestContext } from 'common/logging/request-context';

describe('CorrelationIdMiddleware', () => {
  const middleware = new CorrelationIdMiddleware();
  const setHeader = jest.fn();

  const run = (incoming?: string) => {
    let seen: string | undefined;
    const req = { header: () => incoming } as unknown as Request;
    const res = { setHeader } as unknown as Response;
    const next: NextFunction = () => {
      seen = getRequestContext()?.correlationId;
    };

    middleware.use(req, res, next);
    return seen;
  };

  beforeEach(() => jest.clearAllMocks());

  it('reuses an upstream correlation id so traces survive service hops', () => {
    expect(run('corr-upstream')).toBe('corr-upstream');
    expect(setHeader).toHaveBeenCalledWith(
      CORRELATION_ID_HEADER,
      'corr-upstream',
    );
  });

  it('generates one when the caller did not send it', () => {
    const generated = run();

    expect(generated).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
    expect(setHeader).toHaveBeenCalledWith(CORRELATION_ID_HEADER, generated);
  });

  it('does not leak the context outside the request', () => {
    run('corr-1');

    expect(getRequestContext()).toBeUndefined();
  });
});
