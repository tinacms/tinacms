// The server entry, `tinacms/server`. Never reaches the browser bundle.

import { AsyncLocalStorage } from 'node:async_hooks';
import { invariant } from '../core/invariant';
import type {
  ResolvedServerSegment,
  ServerOp,
  ServerSegment,
} from '../core/plugin';

export type { ResolvedServerSegment, ServerOp, ServerSegment };

// Identity function that keeps `TOps`, so `import type` carries each op's
// signature to the client RPC proxy (ADR-007).
export const defineServerPlugin = <TOps extends ServerSegment>(
  ops: TOps
): TOps => ops;

export interface Session {
  identity: { id: string; name?: string; email?: string };
  roles: string[];
}

// Transport hooks the RPC handler pulls off the auth segment; the composition
// removes them from the routable ops so dispatch can never route them.
export interface AuthTransportHooks {
  getSession: (request: Request) => Promise<Session | null>;
  rolePermissions?: (role: string) => Promise<string[]>;
}

// Defaults so TinaCloud works with no config (ADR-008 §4, §5). Null prototype,
// so a role named "constructor" or "__proto__" resolves to nothing.
export const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = Object.assign(
  Object.create(null),
  {
    admin: ['*'],
    editor: [],
  }
);

// Authorization marks (ADR-008): plain handlers are protected by default,
// `publicOp` opts out. `Symbol.for`, so two copies of this module agree on the tag.
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

export interface ServerRuntime {
  segmentsByNamespace: Map<string, ResolvedServerSegment>;
  authHooks: AuthTransportHooks | null;
  destroy: () => Promise<void>;
}

// Carries the runtime through a dispatch so module-level `use()` resolves
// against the dispatching handler, even when requests overlap.
export const serverRuntimeStorage = new AsyncLocalStorage<ServerRuntime>();

// In-process capability accessor, e.g. `use('content').listAll()` (ADR-007).
// Untyped until the capability contracts land; callers cast.
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
