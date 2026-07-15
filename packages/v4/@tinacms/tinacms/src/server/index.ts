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

// ADR-023 §1: the single primitive every verifier needs — `getSession(request) →
// { identity, roles } | null`. Roles ride in the session; core reads them per request
// and stores nothing (ADR-008).
export interface SessionIdentity {
  id: string;
  name?: string;
  email?: string;
}

export interface Session {
  identity: SessionIdentity;
  roles: string[];
}

// The transport hooks the RPC handler needs from whatever provides `auth`. They live on
// the auth plugin's server segment under these reserved names, which the handler invokes
// directly (getSession receives the raw Request) and never routes as RPC ops.
export interface AuthTransportHooks {
  getSession: (request: Request) => Promise<Session | null>;
  // Role → permission bundles are the auth provider's domain (ADR-008 §3). Absent, the
  // built-in editor/admin defaults apply.
  rolePermissions?: (role: string) => Promise<string[]>;
}

export const AUTH_TRANSPORT_HOOKS = ['getSession', 'rolePermissions'] as const;

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

// Op-level authorization marks (ADR-008 §1/§2). A bare handler is protected by default;
// `publicOp` is the only unauthenticated opt-out (`grep publicOp` enumerates the public
// surface); `protectedOp` additionally names the required permission. Both wrap rather
// than mutate, so one handler reused under two wrappers can't cross-tag. The permission
// stays `string` until codegen aggregates declared permissions into a typed union
// (ADR-008 §3). `Symbol.for`, so duplicate copies of this module (a plugin bundling its
// own tinacms/server) still agree on the tag.
const OP_META = Symbol.for('tinacms.op-meta');

export interface OpMeta {
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

// The composed server runtime: resolved segments by mount namespace (capability key or
// plugin name — core/mount.ts), built once per handler by rpc/handler.ts. The auth
// transport hooks are extracted at compose time (parse, don't validate): dispatch never
// re-checks the auth segment's shape, and `null` means fail-closed — no sessions.
export interface ServerRuntime {
  segmentsByNamespace: Map<string, ResolvedServerSegment>;
  authHooks: AuthTransportHooks | null;
}

// Carries the runtime across an op invocation so the module-level `use()` accessor
// resolves against the handler that dispatched it — safe under interleaved async
// requests, unlike a swapped module global.
export const serverRuntimeStorage = new AsyncLocalStorage<ServerRuntime>();

// Server→server in-process capability accessor (ADR-007): compose capabilities without
// an HTTP hop — `use('content').listAll()`. Typed per-capability contracts arrive with
// the capability-contract ADRs' implementations (019/021/022); until then callers cast.
export const use = (capability: string): ServerSegment => {
  const runtime = serverRuntimeStorage.getStore();
  invariant(
    runtime,
    'use-outside-op',
    "`use(capability)` reads the dispatching handler's runtime, so it only works " +
      'inside a server operation invoked through the RPC handler.'
  );
  const mounted = runtime.segmentsByNamespace.get(capability);
  invariant(
    mounted,
    'use-unknown-capability',
    `No installed plugin provides "${capability}".`
  );
  return mounted.ops;
};
