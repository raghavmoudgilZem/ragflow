import type { TransformableInfo } from 'logform';
import {
  enrichRequestContext,
  getRequestContext,
  requestContextFormat,
  runWithRequestContext,
} from './request-context';

const withContext = requestContextFormat();

const transform = () =>
  withContext.transform({
    level: 'info',
    message: 'test',
  }) as TransformableInfo;

describe('requestContextFormat', () => {
  it('stamps the ambient correlation id onto the record', () => {
    const info = runWithRequestContext(
      { correlationId: 'corr-1', tenantId: 't-1' },
      transform,
    );

    expect(info.correlationId).toBe('corr-1');
    expect(info.tenantId).toBe('t-1');
  });

  it('picks up fields added part-way through the request', () => {
    const info = runWithRequestContext({ correlationId: 'corr-1' }, () => {
      enrichRequestContext({ jobId: 'job-1' });
      return transform();
    });

    expect(info.jobId).toBe('job-1');
  });

  it('is a no-op outside a request scope', () => {
    expect(transform().correlationId).toBeUndefined();
  });
});

describe('runWithRequestContext', () => {
  it('does not leak the context beyond the callback', () => {
    runWithRequestContext({ correlationId: 'corr-1' }, () =>
      expect(getRequestContext()?.correlationId).toBe('corr-1'),
    );

    expect(getRequestContext()).toBeUndefined();
  });
});
