// The Capability RPC transport (ADR-007/008): all server segments compose into one
// Web-standard `Request → Response` handler that adapters mount. JSON-only — binary is
// the media capability's contract (ADR-022); a rich-JSON codec is still open (ADR-007).

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

export type RpcHandler = (request: Request) => Promise<Response>;

export interface RpcHandlerConfig {
  plugins: PluginManifest[];
}

// Composition runs once, on first request; a rejected compose is dropped from the
// cache so the next request retries instead of staying poisoned forever.
export const createRpcHandler = ({ plugins }: RpcHandlerConfig): RpcHandler => {
  let runtimePromise: Promise<ServerRuntime> | null = null;
  return async (request) => {
    runtimePromise ??= composeServerRuntime(plugins).catch((cause) => {
      runtimePromise = null;
      throw cause;
    });
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
    return dispatch(runtime, request);
  };
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
  // Init runs LAST so a deterministic compose failure never leaves initialized
  // plugins behind for the compose-retry to re-init. The teardown is dropped: the
  // server runtime lives for the process; a failed init tears itself down.
  await initializePlugins(plugins);
  return { segmentsByNamespace, authHooks };
};

// Parses the transport hooks off the auth segment AND removes them from its routable
// ops, so dispatch 404s their names via the ordinary own-property lookup. No callable
// getSession → null → every non-public op fails closed. A non-callable rolePermissions
// fails compose: silently substituting the built-in bundles would grant differently
// (admin's wildcard) than the provider intended.
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

const dispatch = async (
  runtime: ServerRuntime,
  request: Request
): Promise<Response> => {
  if (request.method !== 'POST') {
    return errorResponse(405, 'method-not-allowed', 'RPC operations are POST.');
  }
  // CSRF guard (ADR-008): a cross-origin fetch carrying application/json always
  // triggers a CORS preflight the server never answers, so a forged cross-site POST
  // can't reach a state-changing op — even when getSession reads a cookie. Compare
  // the MIME essence, not a substring: a safelisted type carrying the string as a
  // parameter (text/plain; charset=application/json) sends no preflight.
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
  // Adapters mount at an arbitrary base path — the route is the last two segments.
  const segments = new URL(request.url).pathname.split('/').filter(Boolean);
  const namespace = segments.at(-2);
  const opName = segments.at(-1);
  if (!namespace || !opName) {
    return errorResponse(404, 'not-found', 'Expected …/<capability>/<op>.');
  }

  // One catch over everything past routing: it all runs plugin code, and thrown
  // errors carry internals that don't belong in an HTTP body. The runtime context
  // spans the same region so use() resolves from the auth hooks too, not just ops.
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

  // Secure by default (ADR-008 §1): authenticate before invoking anything except an
  // explicit publicOp — which opts out entirely, plugin-level `requires` included,
  // since an unauthenticated caller has no permissions to check.
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

// Own-property + function checks keep prototype members (`toString`) and non-op values
// unroutable; the auth hooks need no rule — compose already claimed them off the ops.
const routedOp = (
  mounted: ResolvedServerSegment,
  opName: string
): ServerOp | undefined => {
  if (!Object.hasOwn(mounted.ops, opName)) return undefined;
  const op = mounted.ops[opName];
  return typeof op === 'function' ? op : undefined;
};

// The single point where ServerOp's authoring-side `never` input is erased for
// invocation — core/plugin.ts explains the contravariance trade.
const invokeOp = (op: ServerOp, input: unknown): Promise<unknown> =>
  (op as (input: unknown) => Promise<unknown>)(input);

const hasPermission = async (
  authHooks: AuthTransportHooks | null,
  session: Session,
  permission: string
): Promise<boolean> => {
  for (const role of session.roles) {
    // A provider that resolves roles owns the whole mapping (ADR-008 §3/§4).
    const permissions = authHooks?.rolePermissions
      ? await authHooks.rolePermissions(role)
      : (DEFAULT_ROLE_PERMISSIONS[role] ?? []);
    if (permissions.includes('*') || permissions.includes(permission)) {
      return true;
    }
  }
  return false;
};

// Every non-2xx body is `{ error: { code, message } }` — the code table is recorded in
// the spec (tinacmsv4 plans/007) pending the error-model ADR; tests pin the literals.
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
