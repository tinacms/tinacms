import { AsyncLocalStorage } from 'node:async_hooks';
import type { Session } from '../core/auth/contract';
import { invariant } from '../core/invariant';

// The request an op was dispatched for, and the session that authorized it.
// Internal: core's content save reads it and hands it to the provider's write.
export interface RequestContext {
  request: Request;
  session: Session | null;
}

// What core's content save hands the provider's `update`. `authProvider` is the
// name of the plugin whose getSession verified the request.
export interface ContentWriteContext extends RequestContext {
  authProvider: string | undefined;
}

export const requestContextStorage = new AsyncLocalStorage<RequestContext>();

export const requestContext = (): RequestContext => {
  const context = requestContextStorage.getStore();
  invariant(
    context,
    'request-context-outside-op',
    'The request context only exists inside an op the RPC handler dispatched.'
  );
  return context;
};
