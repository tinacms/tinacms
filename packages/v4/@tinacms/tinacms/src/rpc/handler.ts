// Capability RPC transport (ADR-007, ADR-008). All server segments compose into one
// Request -> Response handler. JSON only; binary belongs to media (ADR-022).

import { invariant } from '../core/invariant';
import { capabilityMountFor } from '../core/mount';
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
  type ServerRuntime,
  type Session,
  opMeta,
  serverRuntimeStorage,
} from '../server';

export type RpcHandler = ((request: Request) => Promise<Response>) & {
  // Hosts that replace a handler (not end the process) call this so every
  // onInit keeps its onDestroy.
  destroy: () => Promise<void>;
};

export interface RpcHandlerConfig {
  plugins: PluginManifest[];
  // e.g. `/api/tina`. Without it the route is the last two path segments, so
  // any prefix reaches an operation. Set it to pin the route.
  mountPath?: string;
}

// Composition runs once, at the first request. A failure is not cached.
export const createRpcHandler = ({
  plugins,
  mountPath,
}: RpcHandlerConfig): RpcHandler => {
  let runtimePromise: Promise<ServerRuntime> | null = null;
  // Serialises compose/teardown: destroy() clears the cache before onDestroy
  // finishes, so without this a request arriving mid-teardown would run onInit
  // while onDestroy was still running.
  let lifecycleTurn: Promise<void> = Promise.resolve();

  // Compose after the current turn, so a destroy arriving mid-composition tears
  // down what this composition initialized.
  const composeAfterCurrentTurn = (): Promise<ServerRuntime> => {
    const composing = lifecycleTurn.then(() => composeServerRuntime(plugins));
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
    // Refuse before composing: a failed compose is not cached, so an
    // unauthenticated GET would otherwise re-run every plugin import per request.
    const refusal = refusalOf(request);
    if (refusal) return refusal;
    const route = routeOf(request, mountPath);
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
    // A failed composition has nothing to tear down; a failed onDestroy leaves
    // a handle open, so it is logged.
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

const composeServerRuntime = async (
  plugins: PluginManifest[]
): Promise<ServerRuntime> => {
  validateCapabilityGraph(plugins);
  const resolved = await resolveServerSegments(plugins);
  const segmentsByNamespace = composeOverridableRegistry(
    resolved.map((segment) => {
      const mount = capabilityMountFor(segment.manifest);
      return {
        key: mount.namespace,
        value: segment,
        isOverride: mount.isOverride,
      };
    }),
    serverConflictError
  );
  const authHooks = claimAuthTransportHooks(segmentsByNamespace);
  // Init runs last, so a failed composition leaves no initialized plugin behind.
  const destroy = await initializePlugins(plugins);
  return { segmentsByNamespace, authHooks, destroy };
};

// Pull the transport hooks off the auth segment so dispatch 404s them. Without a
// callable getSession this returns null and every non-public op fails closed.
const claimAuthTransportHooks = (
  segmentsByNamespace: Map<string, ResolvedServerSegment>
): AuthTransportHooks | null => {
  const authSegment = segmentsByNamespace.get(AUTH_CAPABILITY);
  if (!authSegment) return null;
  const { getSession, rolePermissions, ...routableOps } = authSegment.ops;
  segmentsByNamespace.set(AUTH_CAPABILITY, {
    ...authSegment,
    ops: routableOps,
  });
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

const refusalOf = (request: Request): Response | null => {
  if (request.method !== 'POST') {
    return errorResponse(405, 'method-not-allowed', 'RPC operations are POST.');
  }
  // CSRF gate 1 (ADR-008): cross-origin application/json always preflights, and
  // this server never answers OPTIONS. Compare the MIME essence, not a substring:
  // `text/plain; charset=application/json` sends no preflight.
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
  // CSRF gate 2: a host app's global CORS middleware voids the preflight gate
  // without touching this file.
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

const dispatch = async (
  runtime: ServerRuntime,
  request: Request,
  { namespace, opName }: RpcRoute
): Promise<Response> => {
  // One catch covers everything after routing: plugin code throws internal
  // details that must not reach an HTTP body.
  try {
    return await serverRuntimeStorage.run(runtime, () =>
      authorizeAndInvokeOp(runtime, request, namespace, opName)
    );
  } catch (cause) {
    console.error(`[tinacms] RPC op "${namespace}/${opName}" failed:`, cause);
    return errorResponse(500, 'op-failed', 'Operation failed.');
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

  // Secure by default (ADR-008 §1): authenticate before invoking. publicOp is
  // the one exception and also skips plugin-level `requires`.
  const meta = opMeta(op);
  if (!meta.public) {
    const session = runtime.authHooks
      ? await runtime.authHooks.getSession(request)
      : null;
    if (!session) {
      return errorResponse(401, 'unauthenticated', 'No CMS session.');
    }
    for (const permission of [
      mounted.manifest.requires?.permission,
      meta.permission,
    ]) {
      if (!permission) continue;
      const allowed = await hasPermission(
        runtime.authHooks,
        session,
        permission
      );
      if (!allowed) {
        return errorResponse(
          403,
          'forbidden',
          `Requires the "${permission}" permission.`
        );
      }
    }
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

  const result = await invokeOp(op, input);
  return Response.json(result ?? null);
};

// Own-property + function checks keep prototype members like `toString` off the
// routes.
const routedOp = (
  mounted: ResolvedServerSegment,
  opName: string
): ServerOp | undefined => {
  if (!Object.hasOwn(mounted.ops, opName)) return undefined;
  const op = mounted.ops[opName];
  return typeof op === 'function' ? op : undefined;
};

const invokeOp = (op: ServerOp, input: unknown): Promise<unknown> =>
  (op as (input: unknown) => Promise<unknown>)(input);

const hasPermission = async (
  authHooks: AuthTransportHooks | null,
  session: Session,
  permission: string
): Promise<boolean> => {
  for (const role of session.roles) {
    const permissions = authHooks?.rolePermissions
      ? await authHooks.rolePermissions(role)
      : (DEFAULT_ROLE_PERMISSIONS[role] ?? []);
    if (permissions.includes('*') || permissions.includes(permission)) {
      return true;
    }
  }
  return false;
};

const errorResponse = (
  status: number,
  code: string,
  message: string
): Response => Response.json({ error: { code, message } }, { status });

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
