import { AsyncLocalStorage } from 'node:async_hooks';
import { invariant } from '../core/invariant';
import type {
  ResolvedServerSegment,
  ServerOp,
  ServerSegment,
} from '../core/plugin';

export type { ResolvedServerSegment, ServerOp, ServerSegment };

export const defineServerPlugin = <TOps extends ServerSegment>(
  ops: TOps
): TOps => ops;

export interface Session {
  identity: { id: string; name?: string; email?: string };
  roles: string[];
}

export interface AuthTransportHooks {
  getSession: (request: Request) => Promise<Session | null>;
  rolePermissions?: (role: string) => Promise<string[]>;
}

export const DEFAULT_ROLE_PERMISSIONS: Readonly<
  Record<string, readonly string[]>
> = Object.freeze(
  Object.assign(Object.create(null), {
    admin: Object.freeze(['*']),
    editor: Object.freeze([]),
  })
);

const OP_META = Symbol.for('tinacms.op-meta');

interface OpMeta {
  public?: true;
  permission?: string;
}

interface TaggedOp {
  [OP_META]?: OpMeta;
}

const tagOp = <TOp extends ServerOp>(handler: TOp, meta: OpMeta): TOp => {
  invariant(
    (handler as TaggedOp)[OP_META] === undefined,
    'op-already-tagged',
    'This handler already carries an authorization mark; wrap the bare handler instead.'
  );
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

export const serverRuntimeStorage = new AsyncLocalStorage<ServerRuntime>();

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
