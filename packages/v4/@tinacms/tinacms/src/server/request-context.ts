import type { Session } from '../core/auth/contract';
import { invariant } from '../core/invariant';

// `authProvider` is the name of the plugin whose getSession verified the request.
export interface RequestContext {
  request: Request;
  session: Session | null;
  authProvider: string | undefined;
}

// This module imports no node module: a browser bundle can reach a provider's
// server segment through its lazy `server` loader. tinacms/server binds the store.
let readStore: () => RequestContext | undefined = () => undefined;

export const bindRequestContextStore = (
  read: () => RequestContext | undefined
): void => {
  readStore = read;
};

export const requestContext = (): RequestContext => {
  const context = readStore();
  invariant(
    context,
    'request-context-outside-op',
    '`requestContext()` only works inside an op the RPC handler dispatched.'
  );
  return context;
};
