// The server entry, `tinacms/server`. The server segments of the plugins import it, and
// so do the framework adapters. It never reaches the browser bundle.

import { AsyncLocalStorage } from 'node:async_hooks';
import { invariant } from '../core/invariant';
import type {
  ResolvedServerSegment,
  ServerOp,
  ServerSegment,
} from '../core/plugin';

export type { ResolvedServerSegment, ServerOp, ServerSegment };

// An identity function, like definePlugin and defineClientPlugin. It keeps `TOps`, so
// the exported type of the segment is the type that `import type` carries to the client
// for the RPC proxy (ADR-007). A wider Record type would erase the signature of every
// operation.
export const defineServerPlugin = <TOps extends ServerSegment>(
  ops: TOps
): TOps => ops;

// The one primitive that every verifier needs (ADR-023 §1). The session carries the
// roles. The core reads them at each request, and stores nothing (ADR-008).
export interface Session {
  identity: { id: string; name?: string; email?: string };
  roles: string[];
}

// The transport hooks that the RPC handler needs from the provider of `auth`. They sit
// on the server segment of the auth plugin, under these names. The composition removes
// them from the routable ops in rpc/handler.ts. The handler then calls them directly,
// and getSession receives the Request. The dispatch can never route them as RPC
// operations.
export interface AuthTransportHooks {
  getSession: (request: Request) => Promise<Session | null>;
  // The auth provider owns the map from a role to its permissions (ADR-008 §3).
  // Without this hook, the built-in defaults for editor and admin apply.
  rolePermissions?: (role: string) => Promise<string[]>;
}

// Tina supplies the editor role and the admin role, so that TinaCloud works with no
// config (ADR-008 §4 and §5). A new permission goes to no role by default, except
// through the wildcard of the admin role. The object has a null prototype, so a role
// with the name of an Object.prototype member resolves to nothing. Two such names are
// "constructor" and "__proto__".
export const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = Object.assign(
  Object.create(null),
  {
    admin: ['*'],
    editor: [],
  }
);

// The authorization marks for an operation (ADR-008). A plain handler is protected by
// default. `publicOp` is the one way to remove that protection, and a search finds it.
// `protectedOp` names the permission that the operation needs. That name is a string
// until codegen builds the typed union. These functions wrap the handler, and do not
// change it, so two wrappers on one handler cannot share a tag. The key uses
// `Symbol.for`, so two copies of this module agree on the tag.
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

// The composed server runtime. rpc/handler.ts builds it once for each handler. It holds
// the segments by mount namespace, and the auth hooks from the composition. A null value
// there fails closed.
export interface ServerRuntime {
  segmentsByNamespace: Map<string, ResolvedServerSegment>;
  authHooks: AuthTransportHooks | null;
  // The teardown from initializePlugins. It runs every onDestroy that its matching
  // onInit paired with, and a second call destroys nothing.
  destroy: () => Promise<void>;
}

// This carries the runtime through a dispatch, so that the module-level `use()`
// resolves against the handler that dispatched it. It stays correct when requests
// overlap.
export const serverRuntimeStorage = new AsyncLocalStorage<ServerRuntime>();

// The in-process accessor for a capability on the server (ADR-007). One example is
// `use('content').listAll()`. The typed contract for each capability arrives with
// ADR-019, ADR-021, and ADR-022. Until then, a caller casts the result.
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
