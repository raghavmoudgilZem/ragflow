import { AsyncLocalStorage } from 'node:async_hooks';
import { format } from 'winston';
import type { TransformableInfo } from 'logform';

/**
 * Per-request / per-message ambient context.
 *
 * Every log line emitted while a request (HTTP) or an event (RabbitMQ) is being
 * handled is stamped with these fields by the `requestContextFormat` winston
 * format, so a production issue can be traced end-to-end from a single
 * `correlationId` without threading it through every function signature.
 */
export interface RequestContext {
  correlationId: string;
  tenantId?: string;
  jobId?: string;
}

const storage = new AsyncLocalStorage<RequestContext>();

export function runWithRequestContext<T>(
  context: RequestContext,
  callback: () => T,
): T {
  return storage.run(context, callback);
}

export function getRequestContext(): RequestContext | undefined {
  return storage.getStore();
}

/**
 * Adds fields to the active context so logs emitted later in the same request
 * carry them too (e.g. the `jobId` only known after the row is inserted).
 * A no-op when called outside a request scope.
 */
export function enrichRequestContext(patch: Partial<RequestContext>): void {
  const store = storage.getStore();
  if (!store) return;
  Object.assign(store, patch);
}

/** Stamps every winston record with the ambient correlation id / tenant / job. */
export const requestContextFormat = format((info: TransformableInfo) => {
  const context = getRequestContext();
  if (!context) return info;

  info.correlationId ??= context.correlationId;
  if (context.tenantId) info.tenantId ??= context.tenantId;
  if (context.jobId) info.jobId ??= context.jobId;

  return info;
});
