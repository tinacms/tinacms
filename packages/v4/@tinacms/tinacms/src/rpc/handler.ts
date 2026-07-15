// The Capability RPC transport (ADR-007/008): every server segment composes into one
// Web-standard `Request → Response` handler that per-framework adapters mount. JSON-only
// — binary is the media capability's own contract (ADR-022), and a rich-JSON codec is a
// still-open ADR-007 sub-decision.

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
import { RPC_ERROR_CODES } from './codes';

export type RpcHandler = (request: Request) => Promise<Response>;

export interface RpcHandlerConfig {
  plugins: PluginManifest[];
}

// Internal-apis.md "handler internally": (1) graph-order the plugin list, (2) lazy-load
// each server segment, (3) wrap every op in the auth + permission transport, (4) route
// `<plugin-or-capability>/<op>`. Composition runs once, on first request.
export const createRpcHandler = ({ plugins }: RpcHandlerConfig): RpcHandler => {
  let runtimePromise: Promise<ServerRuntime> | null = null;
  return async (request) => {
    // A rejected compose must not stay cached — drop it so the next request retries
    // (a transient segment-import failure would otherwise poison the handler forever).
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
        RPC_ERROR_CODES.composeFailed,
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
  // Init runs LAST, once every deterministic compose failure has passed: a
  // namespace conflict or malformed auth provider must not leave initialized
  // plugins behind for the handler's compose-retry to re-init on every request.
  // The returned teardown is dropped — the server runtime lives for the process
  // and there is no compose-side unload to hang it on; a failed init tears its
  // own partial sequence down before rethrowing.
  await initializePlugins(plugins);
  return { segmentsByNamespace, authHooks };
};

// The one place the auth segment's shape is checked (parse, don't validate) — and the
// claim REMOVES the hooks from the routable ops, so dispatch 404s their names through
// the ordinary own-property lookup with no reserved-name blocklist. A missing or
// non-callable getSession yields null — the transport then never has a session, so
// every non-public op fails closed. A present-but-non-callable rolePermissions is a
// malformed provider and fails compose outright: silently falling back to the built-in
// bundles would swap in different grants (admin's wildcard) than the provider intended.
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
    rolePermissions: rolePermissions as
      | AuthTransportHooks['rolePermissions']
      | undefined,
  };
};

const dispatch = async (
  runtime: ServerRuntime,
  request: Request
): Promise<Response> => {
  if (request.method !== 'POST') {
    return errorResponse(
      405,
      RPC_ERROR_CODES.methodNotAllowed,
      'RPC operations are POST.'
    );
  }
  // Adapters mount the handler at an arbitrary base path, so the route is the last two
  // segments: `…/<namespace>/<op>`.
  const segments = new URL(request.url).pathname.split('/').filter(Boolean);
  const namespace = segments.at(-2);
  const opName = segments.at(-1);
  if (!namespace || !opName) {
    return errorResponse(
      404,
      RPC_ERROR_CODES.notFound,
      'Expected …/<capability>/<op>.'
    );
  }

  // One catch over routing, auth, and the op: everything past here runs plugin code
  // (getSession, rolePermissions, the op itself), and any throw stays server-side —
  // failures often carry internals (paths, provider responses) that don't belong in
  // an HTTP body. The runtime context spans the same region, so `use(capability)`
  // resolves from the auth transport hooks too, not just from ops.
  try {
    return await serverRuntimeStorage.run(runtime, () =>
      authorizeAndInvokeOp(runtime, request, namespace, opName)
    );
  } catch (cause) {
    console.error(`[tinacms] RPC op "${namespace}/${opName}" failed:`, cause);
    return errorResponse(500, RPC_ERROR_CODES.opFailed, 'Operation failed.');
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
      RPC_ERROR_CODES.notFound,
      `No operation "${namespace}/${opName}".`
    );
  }

  // Secure by default (ADR-008 §1): authenticate before invoking anything except an
  // explicit publicOp — which opts out entirely, including the plugin-level `requires`
  // gate, since an unauthenticated caller has no permissions to check. With no auth
  // hooks (no provider, or a malformed one) there is no session, so every non-public
  // op fails closed.
  const meta = opMeta(op);
  if (!meta.public) {
    const session = runtime.authHooks
      ? await runtime.authHooks.getSession(request)
      : null;
    if (!session) {
      return errorResponse(
        401,
        RPC_ERROR_CODES.unauthenticated,
        'No CMS session.'
      );
    }
    for (const permission of [
      mounted.manifest.requires?.permission,
      meta.permission,
    ]) {
      if (!permission) continue;
      if (!(await hasPermission(runtime.authHooks, session, permission))) {
        return errorResponse(
          403,
          RPC_ERROR_CODES.forbidden,
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
      return errorResponse(
        400,
        RPC_ERROR_CODES.invalidJson,
        'Body must be JSON.'
      );
    }
  }

  const result = await invokeOp(op, input);
  return Response.json(result ?? null);
};

// Resolves the op a route names, or undefined when the route must 404. The own-property
// and function checks keep prototype members (`toString`) and non-op values unroutable;
// the auth transport hooks need no rule here — compose already claimed them off the
// routable ops (claimAuthTransportHooks).
const routedOp = (
  mounted: ResolvedServerSegment,
  opName: string
): ServerOp | undefined => {
  if (!Object.hasOwn(mounted.ops, opName)) return undefined;
  const op = mounted.ops[opName];
  return typeof op === 'function' ? op : undefined;
};

// The single point where ServerOp's authoring-side `never` input is erased for
// invocation — core/plugin.ts explains the contravariance trade that requires it.
const invokeOp = (op: ServerOp, input: unknown): Promise<unknown> =>
  (op as (input: unknown) => Promise<unknown>)(input);

const hasPermission = async (
  authHooks: AuthTransportHooks | null,
  session: Session,
  permission: string
): Promise<boolean> => {
  for (const role of session.roles) {
    // A provider that resolves roles owns the whole mapping; the built-in
    // editor/admin bundles apply only when it doesn't (ADR-008 §3/§4).
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

// Graph resolution already rejects duplicate names and unsanctioned singleton
// providers, so a compose-time collision means two segments landed on one namespace
// through distinct rules — still named precisely, per the shared registry contract.
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
