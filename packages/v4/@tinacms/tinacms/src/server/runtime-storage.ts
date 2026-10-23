import { AsyncLocalStorage } from 'node:async_hooks';
import type { AuthTransportHooks } from '../core/auth/contract';
import type { ResolvedServerSegment } from '../core/plugin';
import {
  type RequestContext,
  bindRequestContextStore,
} from './request-context';

// The composed server runtime (built once per handler, rpc/handler.ts): segments by
// mount namespace, plus the auth hooks claimed at compose — `null` fails closed.
export interface ServerRuntime {
  segmentsByNamespace: Map<string, ResolvedServerSegment>;
  authHooks: AuthTransportHooks | null;
  authProvider: string | undefined;
  // The teardown from initializePlugins. It runs every onDestroy that its matching
  // onInit paired with, and a second call destroys nothing.
  destroy: () => Promise<void>;
}

// Carries the runtime across a dispatch so the module-level `use()` resolves against
// the handler that dispatched it — safe under interleaved requests.
export const serverRuntimeStorage = new AsyncLocalStorage<ServerRuntime>();

export const requestContextStorage = new AsyncLocalStorage<RequestContext>();
bindRequestContextStore(() => requestContextStorage.getStore());
