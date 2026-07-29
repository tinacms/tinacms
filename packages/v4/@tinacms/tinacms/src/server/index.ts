// Server-only entry — `tinacms/server`.
// Imported by plugin server segments and by per-framework adapters.
// Never reaches the browser bundle.

import { AsyncLocalStorage } from 'node:async_hooks';
import { invariant } from '../core/invariant';
import type {
  ResolvedServerSegment,
  ServerOp,
  ServerSegment,
} from '../core/plugin';

export type { ResolvedServerSegment, ServerOp, ServerSegment };

// Identity helper, mirroring definePlugin/defineClientPlugin: `TOps` is preserved so the
// segment's exported type is what `import type` carries to the client for the RPC proxy
// (ADR-007) — a widened Record would erase every op signature.
export const defineServerPlugin = <TOps extends ServerSegment>(
  ops: TOps
): TOps => ops;

// ADR-023 §1: the single primitive every verifier needs. Roles ride in the session;
// core reads them per request and stores nothing (ADR-008).
export interface Session {
  identity: { id: string; name?: string; email?: string };
  roles: string[];
}

// The transport hooks the RPC handler needs from whatever provides `auth`. They live on
// the auth plugin's server segment under these names; compose claims them off the
// routable ops (rpc/handler.ts), so the handler invokes them directly (getSession
// receives the raw Request) and dispatch can never route them as RPC ops.
export interface AuthTransportHooks {
  getSession: (request: Request) => Promise<Session | null>;
  // Role → permission bundles are the auth provider's domain (ADR-008 §3). Absent, the
  // built-in editor/admin defaults apply.
  rolePermissions?: (role: string) => Promise<string[]>;
}

// ADR-008 §4/§5: Tina ships editor/admin so TinaCloud works with zero config; new
// permissions are granted to nobody by default except admin's wildcard. Null-prototype,
// so a role named after an Object.prototype member ("constructor", "__proto__")
// resolves to nothing rather than an inherited function.
export const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = Object.assign(
  Object.create(null),
  {
    admin: ['*'],
    editor: [],
  }
);

// Op-level authorization marks (ADR-008): bare handlers are protected by default;
// `publicOp` is the only unauthenticated opt-out (greppable); `protectedOp` names the
// required permission (`string` until codegen builds the typed union). Wrapping, not
// mutating, so one handler under two wrappers can't cross-tag; `Symbol.for`, so
// duplicate module copies still agree on the tag.
const OP_META = Symbol.for('tinacms.op-meta');

interface OpMeta {
  public?: true;
  permission?: string;
}

interface TaggedOp {
  [OP_META]?: OpMeta;
}

const tagOp = <TOp extends ServerOp>(handler: TOp, meta: OpMeta): TOp => {
  const wrapped = ((input: never) => handler(input)) as TOp & TaggedOp;
  wrapped[OP_META] = meta;
  return wrapped;
};

export const publicOp = <TOp extends ServerOp>(handler: TOp): TOp =>
  tagOp(handler, { public: true });

export const protectedOp = <TOp extends ServerOp>(
  opts: { permission: string },
  handler: TOp
): TOp => tagOp(handler, { permission: opts.permission });

export const opMeta = (handler: ServerOp): OpMeta =>
  (handler as TaggedOp)[OP_META] ?? {};

// The composed server runtime (built once per handler, rpc/handler.ts): segments by
// mount namespace, plus the auth hooks claimed at compose — `null` fails closed.
export interface ServerRuntime {
  segmentsByNamespace: Map<string, ResolvedServerSegment>;
  authHooks: AuthTransportHooks | null;
  // The teardown from initializePlugins. It runs every onDestroy that its matching
  // onInit paired with, and a second call destroys nothing.
  destroy: () => Promise<void>;
}

// Carries the runtime across a dispatch so the module-level `use()` resolves against
// the handler that dispatched it — safe under interleaved requests.
export const serverRuntimeStorage = new AsyncLocalStorage<ServerRuntime>();

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
