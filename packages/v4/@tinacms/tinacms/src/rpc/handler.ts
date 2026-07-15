// The Capability RPC transport (ADR-007/008): every server segment composes into one
// Web-standard `Request → Response` handler that per-framework adapters mount. JSON-only
// — binary is the media capability's own contract (ADR-022), and a rich-JSON codec is a
// still-open ADR-007 sub-decision.

import { capabilityMountFor, overridesCapabilityMount } from '../core/mount';
import {
  REGISTRY_CONFLICTS,
  type RegistryConflict,
  composeOverridableRegistry,
} from '../core/overridable-registry';
import type { PluginManifest, ServerSegment } from '../core/plugin';
import { resolveCapabilityGraph, resolveServerSegments } from '../core/resolve';
import {
  AUTH_TRANSPORT_HOOKS,
  type AuthTransportHooks,
  DEFAULT_ROLE_PERMISSIONS,
  type ServerRuntime,
  type Session,
  opMeta,
  serverRuntimeStorage,
} from '../server';

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
    runtimePromise ??= composeServerRuntime(plugins);
    return dispatch(await runtimePromise, request);
  };
};

export const composeServerRuntime = async (
  plugins: PluginManifest[]
): Promise<ServerRuntime> => {
  const resolved = await resolveServerSegments(resolveCapabilityGraph(plugins));
  return {
    segmentsByNamespace: composeOverridableRegistry(
      resolved.map((segment) => {
        const mount = capabilityMountFor(segment.manifest);
        return {
          key: mount.namespace,
          value: segment,
          isOverride: overridesCapabilityMount(segment.manifest, mount),
        };
      }),
      serverConflictError
    ),
  };
};

const dispatch = async (
  runtime: ServerRuntime,
  request: Request
): Promise<Response> => {
  if (request.method !== 'POST') {
    return errorResponse(405, 'method-not-allowed', 'RPC operations are POST.');
  }
  // Adapters mount the handler at an arbitrary base path, so the route is the last two
  // segments: `…/<namespace>/<op>`.
  const segments = new URL(request.url).pathname.split('/').filter(Boolean);
  const namespace = segments.at(-2);
  const opName = segments.at(-1);
  if (!namespace || !opName) {
    return errorResponse(404, 'not-found', 'Expected …/<capability>/<op>.');
  }

  const mounted = runtime.segmentsByNamespace.get(namespace);
  // The auth transport hooks are the handler's own seam, not RPC surface — routing
  // them would hand the raw JSON body to code expecting a Request.
  const isTransportHook =
    namespace === 'auth' &&
    (AUTH_TRANSPORT_HOOKS as readonly string[]).includes(opName);
  const op =
    mounted && !isTransportHook && Object.hasOwn(mounted.ops, opName)
      ? mounted.ops[opName]
      : undefined;
  if (!mounted || typeof op !== 'function') {
    return errorResponse(
      404,
      'not-found',
      `No operation "${namespace}/${opName}".`
    );
  }

  // Secure by default (ADR-008 §1): authenticate before dispatching anything except an
  // explicit publicOp — which opts out entirely, including the plugin-level `requires`
  // gate, since an unauthenticated caller has no permissions to check. With no auth
  // provider installed there is no session, so every non-public op fails closed.
  const meta = opMeta(op);
  if (!meta.public) {
    const authHooks = runtime.segmentsByNamespace.get('auth')?.ops as
      | (ServerSegment & AuthTransportHooks)
      | undefined;
    const session = authHooks ? await authHooks.getSession(request) : null;
    if (!session) {
      return errorResponse(401, 'unauthenticated', 'No CMS session.');
    }
    for (const permission of [
      mounted.manifest.requires?.permission,
      meta.permission,
    ]) {
      if (!permission) continue;
      if (!(await hasPermission(authHooks, session, permission))) {
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

  try {
    const result = await serverRuntimeStorage.run(runtime, () =>
      (op as (input: unknown) => Promise<unknown>)(input)
    );
    return Response.json(result ?? null);
  } catch (cause) {
    // The thrown error stays server-side: op failures often carry internals
    // (paths, provider responses) that don't belong in an HTTP body.
    console.error(`[tinacms] RPC op "${namespace}/${opName}" failed:`, cause);
    return errorResponse(500, 'op-failed', 'Operation failed.');
  }
};

const hasPermission = async (
  authHooks: AuthTransportHooks | undefined,
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
