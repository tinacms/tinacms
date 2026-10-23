# ADR-008: Authorization — Secure-by-Default RPC, Permission-Based RBAC

## Status
**Accepted**, amended by [ADR-028](./028-server-save-hooks.md): the default `editor` role holds `content:save` (§5). Builds on [ADR-006](./006-plugin-dependency-resolution.md) (capabilities) and [ADR-007](./007-full-stack-plugins-client-backend-segments.md) (Capability RPC). The original v4 docs treated auth as "just a plugin" and said nothing about authorizing the RPC surface; this fills that gap.

## Context
Every Capability RPC operation becomes an HTTP route on the user's **Backend**. Without a rule for who may call them, authorization is per-plugin discipline — and one forgotten check ships an unauthenticated mutation to production. We also want plugins to be restrictable by role/permission, configurable per project.

## Decision

### 1. Secure by default
The RPC transport authenticates a CMS session (via whatever provides the `auth` capability) **before dispatching to any operation**. A bare handler is protected. The *only* way to expose a public endpoint is the explicit, greppable `publicOp()` wrapper:

```ts
media: {
  async upload(input) { /* protected by default */ },
  health: publicOp(async () => ({ ok: true })),   // explicit, auditable opt-out
}
```

`grep publicOp` enumerates the entire unauthenticated attack surface. Forgetting anything fails closed.

### 2. Permission-based RBAC (not role-checked)
The unit checked is a **permission** (`'media:delete'`), never a hardcoded role name. **Roles are bundles of permissions.** This keeps third-party plugins from baking in role names that don't match a given org.

```ts
delete: protectedOp({ permission: 'media:delete' }, handler)   // per-op
definePlugin({ name: 'editorial-workflow', requires: { permission: 'content:publish' } })  // whole plugin (gates UI + ops)
```

### 3. Permission vocabulary is code; role definitions/assignments are runtime data
- **Code (config/plugins):** plugins *declare* the permissions they introduce (with descriptions); codegen aggregates them into a typed `Permission` union (autocomplete + typo errors in any `permissions`/`requires` usage), and a `tina permissions` CLI lists them with their defining plugin. `requires`/`protectedOp` are type-checked against this union.
- **Runtime data (NOT tina config):** role→permission bundles and user→role assignments change without a redeploy, so they are **not** in tina config. They are owned by the `auth` provider's domain. Tina core *consumes* roles from the session and stores nothing.

### 4. Management is the auth provider's job; TinaCloud works out of the box
- **TinaCloud** manages `editor`/`admin` in its dashboard. Tina ships default `editor`/`admin` roles, so TinaCloud users get working authorization with zero config.
- **Auth0/Clerk/Okta/GitHub teams** manage roles in their own UIs; Tina reads them from the token.
- The permission model works on every provider; the **only** limit is how many distinct roles a provider can *assign*. TinaCloud auth caps at editor/admin until it supports more; custom roles require a provider that can assign them.

### 5. Invariants
- **Client checks are UX; the server transport is the sole enforcement.** The client hides/disables plugin UI the user can't use; the server rejects the RPC. The server never trusts the client.
- **RBAC data is operational, not content → it is not stored in git.** This preserves "git is the source of truth *for content*" without pretending assignment data belongs in commits.
- **New permissions are granted to nobody by default** except `admin` (`['*']`). Installing a plugin never silently widens an existing role.
- **One exception: the default `editor` role holds `content:save`** ([ADR-028](./028-server-save-hooks.md)). A save to a collection with a server hook goes through the Backend's `content/update` op, which requires `content:save`. Without it, an editor could not save those collections. A role that should not save, such as a viewer, still leaves it out (ADR-014 §4).

## Consequences

### Positive
- The dangerous mistake (an unprotected mutation) requires actively typing `publicOp`, and the public surface is greppable.
- One auth concept (the `auth` capability) powers both authentication and permission resolution.
- Permissions are discoverable and type-safe via the existing codegen.
- Tina core stays storage-free for RBAC; "no database" holds.

### Negative
- With TinaCloud auth (or any provider lacking custom roles), custom roles defined anywhere are inert until the provider can assign them. Documented, not hidden.

## Deferred (not in v4 core)
- A first-party **RBAC-management plugin** (admin UI to compose roles + assign users, backed by a small store) for self-hosted setups whose provider lacks role management. To be discussed later.
- Per-document / per-field permissions; role hierarchies/inheritance.

## References
- [CONTEXT.md](./CONTEXT.md) — Permission, Role, Capability RPC
- [ADR-007](./007-full-stack-plugins-client-backend-segments.md)
</content>
