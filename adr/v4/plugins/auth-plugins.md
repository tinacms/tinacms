# Auth Plugins

> **Canonical sources:** [ADR-008](../008-authorization-permissions-roles.md), [ADR-007](../007-full-stack-plugins-client-backend-segments.md); [CONTEXT.md](../CONTEXT.md) for **Permission**, **Role**, **Capability RPC**.

An auth plugin provides the **singleton `auth` capability**. It does two jobs:

1. **Authenticates a CMS session** — the user's login flow.
2. **Supplies the session** that the RPC transport reads before dispatching every Capability RPC call (the secure-by-default mechanism in [ADR-008](../008-authorization-permissions-roles.md)).

It is *not* the same as the user's general app auth — though it often delegates to the same provider (Auth0, Clerk, Okta, GitHub, …).

## Manifest

```ts
import { definePlugin } from 'tinacms'

export default definePlugin({
  name: 'auth0',
  provides: ['auth'],
  client: () => import('./client'),
  server: () => import('./server'),
})
```

`auth` is **singleton**: one provider per project. Almost every other plugin `dependsOn: ['auth']` because the RPC transport needs it.

## What the auth capability supplies

```ts
// the shape every `auth` provider's server segment must satisfy
interface AuthServer {
  // Verify a request — called by the RPC transport before every dispatch
  verify(req: Request): Promise<Session | null>
}

interface Session {
  user: { id: string; email?: string; name?: string }
  roles: string[]            // names of roles assigned to the user (runtime data)
  permissions: Permission[]  // resolved from roles, or directly from the provider
}
```

`Session.roles` and `Session.permissions` are **runtime data owned by the auth provider** — *not* in `defineConfig`, *not* in git. ([ADR-008 §3](../008-authorization-permissions-roles.md))

## Server segment

```ts
// server.ts
import { defineServerPlugin } from 'tinacms/server'
import { jwtVerify } from 'jose'

export default defineServerPlugin<AuthServer>({
  async verify(req) {
    const token = req.headers.get('authorization')?.replace(/^Bearer /, '')
    if (!token) return null
    const { payload } = await jwtVerify(token, JWKS)
    return {
      user: { id: payload.sub!, email: payload.email as string },
      roles: payload.roles as string[],
      permissions: resolvePermissions(payload.roles as string[]),
    }
  },
})
```

The RPC transport calls `verify` on every request before dispatching to any other plugin's server segment. A `null` return rejects the call. ([ADR-008 §1](../008-authorization-permissions-roles.md))

## Client segment

```ts
// client.ts
import { defineClientPlugin, server } from 'tinacms'

export default defineClientPlugin({
  slice: (set, get) => ({
    user: null,
    roles: [],
    permissions: [],

    async login() {
      // Provider-specific login flow (popup, redirect, …)
      const session = await auth0LoginFlow()
      set({ user: session.user, roles: session.roles, permissions: session.permissions })
    },

    async logout() {
      await auth0LogoutFlow()
      set({ user: null, roles: [], permissions: [] })
    },
  }),

  components: { LoginDialog, UserMenu },
})
```

Reading `get().auth.user` from any other client slice is the **client→client** communication path.

## Permission checks

Client-side permission checks are **UX only** (hide/disable UI the user can't use); the server transport is the sole enforcement. ([ADR-008 §5](../008-authorization-permissions-roles.md))

```tsx
import { useHasPermission } from 'tinacms/react'

function DeleteButton() {
  const can = useHasPermission('media:delete')      // UX only
  if (!can) return null
  return <button onClick={…}>Delete</button>
}
```

On the server, the permission gate is the wrapper, not a manual check:

```ts
delete: protectedOp({ permission: 'media:delete' }, async (input) => { … })
```

## Roles

A **role** is a named bundle of permissions. Roles and user→role assignments are *operational data*:

- **TinaCloud auth** manages `editor` / `admin` in its dashboard. Tina ships these as defaults so TinaCloud users get working authorization with zero config.
- **Auth0 / Clerk / Okta / GitHub teams** manage roles in their own UIs; the auth plugin reads them from the token (`payload.roles`).
- The permission model works on every provider; the only limit is how many distinct roles a provider can *assign*.

`defineConfig` **never** holds role definitions or assignments. RBAC data is operational, not content → it is not stored in git. ([ADR-008 §3](../008-authorization-permissions-roles.md))

## Permissions are declared by plugins

Each plugin declares the permissions it introduces:

```ts
definePlugin({
  name: 's3-media',
  provides: ['media'],
  permissions: [
    { name: 'media:upload', description: 'Upload new media' },
    { name: 'media:delete', description: 'Delete media files' },
  ],
  // …
})
```

Codegen aggregates these into a typed `Permission` union: `'media:upload' | 'media:delete' | 'content:publish' | …`. `protectedOp({ permission })` and `requires: { permission }` are type-checked against it; `tina permissions` lists everything declared, with its source plugin.

**New permissions are granted to nobody by default** except `admin` (which holds `['*']`). Installing a plugin never silently widens an existing role. ([ADR-008 §5](../008-authorization-permissions-roles.md))

## Built-in providers

- **`tinaCloudAuth()`** — bundled with `tinaCloud()`. Manages `editor` / `admin`.
- **`localAuth()`** — dev-only; trusts any session, used for local development against the Local Data Layer.

Common third-party shapes:

- `auth0Auth({ domain, clientId, audience })`
- `clerkAuth({ publishableKey })`
- `oktaAuth({ issuer, clientId })`
- `gitHubAuth({ clientId, allowedOrgs })`

## Deferred

- A first-party **RBAC-management plugin** (admin UI to compose roles + assign users, backed by a small store) for self-hosted setups whose provider lacks role management. ([ADR-008 deferred](../008-authorization-permissions-roles.md))
- Per-document / per-field permissions; role hierarchies/inheritance.

## Related

- [ADR-008](../008-authorization-permissions-roles.md) — the decision in full
- [Plugin System](../architecture/plugin-system.md) — `dependsOn: ['auth']`
- [Custom Plugins](./custom-plugins.md)
