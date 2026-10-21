// The capability RPC transport (ADR-007 and ADR-008). Every server segment composes into
// one handler that takes a Request and returns a Response, and the adapters mount that
// handler. It carries JSON only. Binary data belongs to the media capability (ADR-022).
// A codec for richer JSON is still an open question (ADR-007).

import type { TinaSchema } from '../config';
import { CONTENT_SAVE_PERMISSION } from '../core/content/contract';
import {
  type ServerHookRegistry,
  type ServerSaveConfig,
  createServerHookRegistry,
  createServerSave,
} from '../core/form/server-hooks';
import { invariant } from '../core/invariant';
import { capabilityMountsFor, capabilityProvider } from '../core/mount';
import {
  REGISTRY_CONFLICTS,
  type RegistryConflict,
  composeOverridableRegistry,
} from '../core/overridable-registry';
import { AUTH_CAPABILITY, type PluginManifest } from '../core/plugin';
import {
  initializePlugins,
  resolveServerSegments,
  validateCapabilityGraph,
} from '../core/resolve';
import {
  type AuthTransportHooks,
  DEFAULT_ROLE_PERMISSIONS,
  type ResolvedServerSegment,
  type ServerOp,
  type ServerSegment,
  type ServerRuntime,
  type Session,
  opMeta,
  protectedOp,
  requestContext,
  requestContextStorage,
  serverRuntimeStorage,
} from '../server';
import { errorResponse, toErrorResponse } from './error-response';

export type RpcHandler = ((request: Request) => Promise<Response>) & {
  // Tear the composed plugins down. A host that replaces a handler instead of ending
  // with the process calls this on the old one, so every onInit keeps its onDestroy.
  destroy: () => Promise<void>;
};

export interface RpcHandlerConfig {
  plugins: PluginManifest[];
  // The config's `rpcUrl`: where the adapter mounted this handler. Without it the
  // route is the last two segments of the path, so any prefix reaches an operation and
  // a proxy rule keyed on an exact path does not hold. Set it to pin the route.
  rpcUrl?: string;
  // The collections, so a content save runs the server hooks each one lists.
  // Required once a plugin registers a server hook.
  schema?: TinaSchema;
}

// The composition runs once, at the first request. A failed composition leaves the
// cache, so the next request tries again.
export const createRpcHandler = ({
  plugins,
  rpcUrl,
  schema,
}: RpcHandlerConfig): RpcHandler => {
  let runtimePromise: Promise<ServerRuntime> | null = null;
  // The composition and the teardown of this handler run in one sequence. destroy()
  // clears the cache before its onDestroy hooks finish, so a request arriving during a
  // teardown composes again — and without this it would run onInit while onDestroy was
  // still running. TinaProvider serialises the same pair on the client.
  let lifecycleTurn: Promise<void> = Promise.resolve();

  // Compose after the current turn, and become the next one, so a destroy that arrives
  // mid-composition tears down what this composition initialized.
  const composeAfterCurrentTurn = (): Promise<ServerRuntime> => {
    const composing = lifecycleTurn.then(() =>
      composeServerRuntime(plugins, schema)
    );
    lifecycleTurn = composing.then(
      () => undefined,
      () => undefined
    );
    const composed: Promise<ServerRuntime> = composing.catch((cause) => {
      if (runtimePromise === composed) runtimePromise = null;
      throw cause;
    });
    return composed;
  };

  const handler = async (request: Request): Promise<Response> => {
    // The route is settled before the runtime composes. Composing imports every
    // plugin's server segment and runs its onInit, and a failed compose is not cached
    // — so an unauthenticated GET would start that work again on every request.
    const refusal = refusalOf(request);
    if (refusal) return refusal;
    const route = routeOf(request, rpcUrl);
    if (!route) {
      return errorResponse(404, 'not-found', 'Expected …/<capability>/<op>.');
    }

    runtimePromise ??= composeAfterCurrentTurn();
    let runtime: ServerRuntime;
    try {
      runtime = await runtimePromise;
    } catch (cause) {
      console.error('[tinacms] RPC server runtime failed to compose:', cause);
      return errorResponse(
        500,
        'runtime-compose-failed',
        'Server runtime failed to compose.'
      );
    }
    return dispatch(runtime, request, route);
  };

  handler.destroy = async () => {
    const composed = runtimePromise;
    runtimePromise = null;
    const currentTurn = lifecycleTurn;
    // Nothing composed, or a composition that failed: there is no initialized plugin
    // to tear down, and that failure already reached the request that triggered it. A
    // failed onDestroy is another matter — it leaves a handle open — so it is logged
    // here, as initializePlugins logs the teardown that rolls back a failed init.
    lifecycleTurn = (async () => {
      await currentTurn;
      const runtime = await composed?.catch(() => null);
      await runtime?.destroy();
    })().catch((cause) => {
      console.error('[tinacms] RPC plugin teardown failed:', cause);
    });
    await lifecycleTurn;
  };

  return handler;
};

const composeServerSegments = async (
  plugins: PluginManifest[]
): Promise<
  Omit<ServerRuntime, 'destroy'> & {
    hooks: ServerHookRegistry;
    resolveBranch: ServerSegment['resolveBranch'];
  }
> => {
  validateCapabilityGraph(plugins);
  const resolved = await resolveServerSegments(plugins);
  const hooks = createServerHookRegistry(plugins, resolved);
  const contentProvider = capabilityProvider(plugins, 'content');
  const resolveBranch = resolved.find(
    ({ manifest }) => manifest === contentProvider
  )?.ops.resolveBranch;
  const segmentsByNamespace = composeOverridableRegistry(
    resolved.flatMap((segment) =>
      capabilityMountsFor(segment.manifest).map((mount) => ({
        key: mount.namespace,
        value: segment,
        isOverride: mount.isOverride,
      }))
    ),
    serverConflictError
  );
  claimReservedKeys(segmentsByNamespace);
  return {
    hooks,
    resolveBranch,
    segmentsByNamespace,
    authHooks: claimAuthTransportHooks(
      segmentsByNamespace,
      capabilityProvider(plugins, AUTH_CAPABILITY)
    ),
    authProvider: capabilityProvider(plugins, AUTH_CAPABILITY)?.name,
  };
};

const composeServerRuntime = async (
  plugins: PluginManifest[],
  schema: TinaSchema | undefined
): Promise<ServerRuntime> => {
  const { hooks, resolveBranch, ...composed } =
    await composeServerSegments(plugins);
  invariant(
    hooks.size === 0 || schema,
    'rpc-server-hooks-no-schema',
    'A plugin registers a server hook, but the RPC handler has no `schema`. ' +
      'Pass the config schema to mountHandler so a save runs the hooks its collection lists.'
  );
  wrapContentSave(
    composed.segmentsByNamespace,
    capabilityProvider(plugins, 'content'),
    { hooks, collections: schema?.collections, resolveBranch }
  );
  // The init runs last, so a failed composition leaves no initialized plugin behind
  // for the next attempt. The teardown travels on the runtime: a handler that is
  // replaced rather than ending with the process — a dev server re-evaluating its
  // route module — would otherwise run every onInit again with no matching onDestroy.
  const destroy = await initializePlugins(plugins);
  return { ...composed, destroy };
};

// Runs no onInit, so a getSession must not depend on state that onInit sets.
// The local Data Layer checks its requests through this.
export const createRequestAuthorizer = (plugins: PluginManifest[]) => {
  let composing: Promise<ServerRuntime> | null = null;
  return async (
    request: Request,
    permissions: (string | undefined)[]
  ): Promise<Authorization> => {
    composing ??= composeServerSegments(plugins).then(
      (composed) => ({ ...composed, destroy: async () => {} }),
      (cause) => {
        composing = null;
        throw cause;
      }
    );
    const runtime = await composing;
    return serverRuntimeStorage.run(runtime, () =>
      authorizeRequest(runtime, request, permissions)
    );
  };
};

// The reserved keys hold core's own inputs, not ops, so they never route.
const claimReservedKeys = (
  segmentsByNamespace: Map<string, ResolvedServerSegment>
): void => {
  for (const [namespace, segment] of segmentsByNamespace) {
    const { hooks, resolveBranch, ...routableOps } = segment.ops;
    segmentsByNamespace.set(namespace, { ...segment, ops: routableOps });
  }
};

// The hooks live in the content provider's own `update` op, so every namespace that
// mounts it runs them: a plugin that provides several singletons mounts at each. A
// plugin that provides content but lost it to an override keeps no `update`.
const wrapContentSave = (
  segmentsByNamespace: Map<string, ResolvedServerSegment>,
  contentProvider: PluginManifest | undefined,
  saveConfig: Omit<ServerSaveConfig, 'write'>
): void => {
  for (const [namespace, segment] of segmentsByNamespace) {
    const { update, ...otherOps } = segment.ops;
    if (!segment.manifest.provides.includes('content') || !update) continue;
    if (segment.manifest !== contentProvider || typeof update !== 'function') {
      segmentsByNamespace.set(namespace, { ...segment, ops: otherOps });
      continue;
    }
    const save = createServerSave({
      ...saveConfig,
      write: (input) => invokeOp(update, input),
    });
    segmentsByNamespace.set(namespace, {
      ...segment,
      ops: {
        ...segment.ops,
        update: protectedOp(
          { permission: CONTENT_SAVE_PERMISSION },
          async (input: unknown) => save(input, requestContext().session)
        ),
      },
    });
  }
};

// Read the transport hooks from the auth segment, and remove them from the routable
// ops of every segment that provides auth. A plugin providing several singletons
// mounts its one segment at each, so `media/getSession` would otherwise route. The
// dispatch then returns 404 for their names through its normal lookup.
// A client-only auth plugin that overrides a server one leaves no hooks.
// Without a callable getSession, this returns null, so every non-public op fails
// closed. A rolePermissions that is not callable fails the composition.
const claimAuthTransportHooks = (
  segmentsByNamespace: Map<string, ResolvedServerSegment>,
  authProvider: PluginManifest | undefined
): AuthTransportHooks | null => {
  const authSegment = segmentsByNamespace.get(AUTH_CAPABILITY);
  for (const [namespace, segment] of segmentsByNamespace) {
    if (!segment.manifest.provides.includes(AUTH_CAPABILITY)) continue;
    const { getSession, rolePermissions, ...routableOps } = segment.ops;
    segmentsByNamespace.set(namespace, { ...segment, ops: routableOps });
  }
  if (!authSegment || authSegment.manifest !== authProvider) return null;
  const { getSession, rolePermissions } = authSegment.ops;
  if (typeof getSession !== 'function') return null;
  invariant(
    rolePermissions === undefined || typeof rolePermissions === 'function',
    'auth-role-permissions-not-callable',
    'The auth provider declares `rolePermissions` but it is not a function.'
  );
  return {
    getSession: getSession as AuthTransportHooks['getSession'],
    rolePermissions: rolePermissions as AuthTransportHooks['rolePermissions'],
  };
};

interface RpcRoute {
  namespace: string;
  opName: string;
}

// Why a request is refused before it reaches an operation, or null when nothing here
// refuses it: the method and the two CSRF gates. None of them needs a composed plugin
// to answer, which is why they run before the runtime exists.
const refusalOf = (request: Request): Response | null => {
  if (request.method !== 'POST') {
    return errorResponse(405, 'method-not-allowed', 'RPC operations are POST.');
  }
  // The CSRF guard (ADR-008). A cross-origin fetch with application/json always
  // starts a CORS preflight, and this server never answers one. A forged cross-site
  // POST therefore cannot reach an operation that changes state, even when getSession
  // reads a cookie. Compare the MIME essence, and not a substring. A safelisted type
  // that holds the string as a parameter sends no preflight. One example is
  // `text/plain; charset=application/json`.
  const mimeEssence = request.headers
    .get('content-type')
    ?.replace(/;.*/, '')
    .trim()
    .toLowerCase();
  if (mimeEssence !== 'application/json') {
    return errorResponse(
      415,
      'unsupported-media-type',
      'RPC requests must be application/json.'
    );
  }
  // The second gate. The preflight above holds only while nothing answers OPTIONS, and
  // a host app that mounts a global CORS middleware voids it without touching this
  // file. A browser that sends this header states the relationship itself.
  if (request.headers.get('sec-fetch-site') === 'cross-site') {
    return errorResponse(
      403,
      'cross-site-forbidden',
      'Cross-site RPC requests are refused.'
    );
  }
  return null;
};

const routeOf = (request: Request, mountPath?: string): RpcRoute | null => {
  const segments = new URL(request.url).pathname.split('/').filter(Boolean);
  const routed = mountPath
    ? segmentsBelowMount(segments, mountPath)
    : segments.slice(-2);
  const [namespace, opName] = routed ?? [];
  if (!namespace || !opName) return null;
  return { namespace, opName };
};

const segmentsBelowMount = (
  segments: string[],
  mountPath: string
): string[] | null => {
  const mount = mountPath.split('/').filter(Boolean);
  if (segments.length !== mount.length + 2) return null;
  if (mount.some((segment, index) => segments[index] !== segment)) return null;
  return segments.slice(mount.length);
};

// One catch covers all the code after the routing, because that code belongs to the
// plugins. A thrown error carries internal details, which must not reach an HTTP
// body. The runtime context covers the same region, so use() also resolves inside
// the auth hooks.
const dispatch = async (
  runtime: ServerRuntime,
  request: Request,
  { namespace, opName }: RpcRoute
): Promise<Response> => {
  try {
    return await serverRuntimeStorage.run(runtime, () =>
      authorizeAndInvokeOp(runtime, request, namespace, opName)
    );
  } catch (cause) {
    return toErrorResponse(cause, `RPC op "${namespace}/${opName}"`);
  }
};

const authorizeAndInvokeOp = async (
  runtime: ServerRuntime,
  request: Request,
  namespace: string,
  opName: string
): Promise<Response> => {
  const mounted = runtime.segmentsByNamespace.get(namespace);
  const op = mounted ? routedOp(mounted, opName) : undefined;
  if (!mounted || !op) {
    return errorResponse(
      404,
      'not-found',
      `No operation "${namespace}/${opName}".`
    );
  }

  // Secure by default (ADR-008 §1). Authenticate the caller before you invoke an
  // operation. A publicOp is the one exception. It also skips the plugin-level
  // `requires`, because a caller with no session has no permissions to check.
  const meta = opMeta(op);
  let session: Session | null = null;
  if (!meta.public) {
    const authorization = await authorizeRequest(runtime, request, [
      mounted.manifest.requires?.permission,
      meta.permission,
    ]);
    if ('refusal' in authorization) return authorization.refusal;
    session = authorization.session;
  }

  let input: unknown;
  const body = await request.text();
  if (body) {
    try {
      input = JSON.parse(body);
    } catch {
      return errorResponse(400, 'invalid-json', 'Body must be JSON.');
    }
  }

  const result = await requestContextStorage.run(
    { request, session, authProvider: runtime.authProvider },
    () => invokeOp(op, input)
  );
  return Response.json(result ?? null);
};

export type Authorization = { session: Session } | { refusal: Response };

const refuse = (
  status: number,
  code: string,
  message: string
): Authorization => ({ refusal: errorResponse(status, code, message) });

// The session, when it grants every permission. Otherwise the refusal to send.
const authorizeRequest = async (
  runtime: ServerRuntime,
  request: Request,
  permissions: (string | undefined)[]
): Promise<Authorization> => {
  if (!runtime.authHooks) {
    return refuse(401, 'unauthenticated', 'No CMS session.');
  }
  const session = await runtime.authHooks.getSession(request);
  if (!session) {
    return refuse(401, 'unauthenticated', 'No CMS session.');
  }
  for (const permission of permissions) {
    if (!permission) continue;
    const allowed = await hasPermission(runtime.authHooks, session, permission);
    if (!allowed) {
      return refuse(
        403,
        'forbidden',
        `Requires the "${permission}" permission.`
      );
    }
  }
  return { session };
};

// The own-property check and the function check keep the prototype members, such as
// `toString`, and any value that is not an operation, off the routes. The auth hooks
// need no rule here, because the composition already removed them from the ops.
const routedOp = (
  mounted: ResolvedServerSegment,
  opName: string
): ServerOp | undefined => {
  if (!Object.hasOwn(mounted.ops, opName)) return undefined;
  const op = mounted.ops[opName];
  return typeof op === 'function' ? op : undefined;
};

// The one place that removes the `never` input of ServerOp for the call.
// core/plugin.ts explains that choice.
const invokeOp = (op: ServerOp, input: unknown): Promise<unknown> =>
  (op as (input: unknown) => Promise<unknown>)(input);

const hasPermission = async (
  authHooks: AuthTransportHooks,
  session: Session,
  permission: string
): Promise<boolean> => {
  for (const role of session.roles) {
    // A provider that resolves the roles owns the whole map (ADR-008 §3 and §4).
    const permissions = authHooks.rolePermissions
      ? await authHooks.rolePermissions(role)
      : (DEFAULT_ROLE_PERMISSIONS[role] ?? []);
    if (permissions.includes('*') || permissions.includes(permission)) {
      return true;
    }
  }
  return false;
};

const serverConflictError = (
  conflict: RegistryConflict,
  namespace: string
): Error =>
  new Error(
    conflict === REGISTRY_CONFLICTS.duplicateOverride
      ? `Two plugins both declare an \`overrides\` for "${namespace}" server ops.`
      : `Two plugins mount server ops at "${namespace}". Declare \`overrides\` ` +
          'on the intended replacement.'
  );
