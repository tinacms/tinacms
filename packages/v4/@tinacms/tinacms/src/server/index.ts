// Server-only entry — `tinacms/server`.
// Imported by plugin server segments and by per-framework adapters.
// Never reaches the browser bundle.

import type { AuthTransportHooks, Session } from '../core/auth/contract';
import { invariant } from '../core/invariant';
import { publicOp, tagOp } from './op-meta';
import { serverRuntimeStorage } from './runtime-storage';
import type {
  ResolvedServerSegment,
  ServerOp,
  ServerSegment,
} from '../core/plugin';

export { toUserId, type UserId } from '../core/auth/contract';
export { publicOp };
export { type RequestContext, requestContext } from './request-context';
export {
  defineServerHook,
  HookRejectedError,
  reject,
  type ServerFormHooks,
  type ServerHookFactory,
  type ServerHookScope,
} from '../core/form/hooks';
export type {
  SearchIndexProvider,
  SearchRecord,
} from '../core/search/index-contract';
export type {
  AuthTransportHooks,
  ResolvedServerSegment,
  ServerOp,
  ServerSegment,
  Session,
};

// Identity helper, mirroring definePlugin/defineClientPlugin: `TOps` is preserved so the
// segment's exported type is what `import type` carries to the client for the RPC proxy
// (ADR-007) — a widened Record would erase every op signature.
export const defineServerPlugin = <TOps extends ServerSegment>(
  ops: TOps
): TOps => ops;

export { DEFAULT_ROLE_PERMISSIONS } from '../core/auth/default-roles';

export const protectedOp = <TOp extends ServerOp>(
  opts: { permission: string },
  handler: TOp
): TOp => tagOp(handler, { permissions: [opts.permission] });

// Server→server in-process capability accessor (ADR-007) — `use('content').listAll()`.
// Typed per-capability contracts arrive with ADR-019/021/022; until then callers cast.
export const use = (capability: string): ServerSegment => {
  const runtime = serverRuntimeStorage.getStore();
  invariant(
    runtime,
    'use-outside-op',
    '`use(capability)` only works inside code dispatched by the RPC handler.'
  );
  const mounted = runtime.segmentsByNamespace.get(capability);
  invariant(
    mounted,
    'use-unknown-capability',
    `No installed plugin provides "${capability}".`
  );
  return mounted.ops;
};
