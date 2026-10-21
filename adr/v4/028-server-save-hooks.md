# ADR-028: Server Save Hooks

## Status
**Proposed** (2026-10-21). Supersedes [ADR-018](./018-save-flow.md) §1 for server-hooked collections only. Saves to every other collection stay on ADR-018 path A. Amends [ADR-025](./025-form-hook-registration.md) §1 and §7, and [ADR-008](./008-authorization-permissions-roles.md) §5 (the default `editor` role holds `content:save`). Builds on [ADR-007](./007-full-stack-plugins-client-backend-segments.md) (segments, Capability RPC), [ADR-008](./008-authorization-permissions-roles.md) (enforcement), [ADR-014](./014-document-lifecycle-hooks.md) §3 (server `beforeSave` enforces) and [ADR-015](./015-execution-boundary.md) (what runs where).

## Context
ADR-014 §3 says authoritative `beforeSave` enforcement runs on the server. ADR-018 then sent every content write straight from the browser to the Data Layer (path A). TinaCloud runs no plugin code, so custom enforcement became self-hosted-only. A Self-Hosted Data Layer is not built yet.

The result: `beforeSave` and `afterSave` run only in the browser. Nothing on a production site enforces a save rule, and a TinaCloud site has no way to add one.

Every site with a server runtime already has a **Backend** that runs plugin server segments, verifies the editor's session and holds secrets. It can run the hooks, if the save goes through it.

## Decision

### 1. A hook can have a server side
`defineHook(name, { client, server })` declares both sides of a hook under one name. `server` is a lazy `() => import('./x.server')`, so server code is never loaded in the browser. The old `defineHook(name, factory)` form stays and means client only. ADR-025 §1 records the registration rules.

```ts
// tina/hooks.ts
export const slug = defineHook('slug', {
  client: () => ({ beforeSave: (doc) => ({ ...doc, slug: lower(doc.slug) }) }),
  server: () => import('./slug.server'),
});

// tina/slug.server.ts
import { defineServerHook, reject } from 'tinacms/server';

export default defineServerHook(() => ({
  beforeSave: (doc, { session }) => {
    if (doc.published && !session?.roles.includes('admin')) {
      reject('Only admins can publish');
    }
    return doc;
  },
}));
```

A server hook receives `{ path, collection, session, branch }` (ADR-025 §7). `session` is the saving user's **Session**, or `null` without an auth plugin. `branch` is the branch the provider writes to: `tinaCloud()` resolves the project's default branch when the caller sends none. It is `undefined` on a Data Layer with no branches, such as the Local Data Layer.

### 2. Server-hooked saves go through the Backend
A **server-hooked collection** lists at least one hook with a server side. A save to it takes this path:

```text
post (server hook):   Browser ──▶ Backend RPC content/update ── getSession ── beforeSave ── write ── afterSave ──▶ provider
tag  (no server hook): Browser ──────────────────────────────────────────────────────────────────────────────▶ provider
```

1. The browser calls `content/update` on the site's Backend over Capability RPC (`POST /api/tina/content/update`).
2. The transport calls `getSession` to authorize the request. The hooks reuse that session, so it is fetched once per save.
3. The server `beforeSave` hooks run as a pipeline, in the collection's order (ADR-025 §3). Each one receives the previous one's output.
4. The content provider's `update` writes the result.
5. The server `afterSave` observers run.

A hook in the collection's list that has no server side is client only, and the server skips it.

Every other save goes straight to the content provider, as ADR-018 path A says.

### 3. Core routes the save from the hook registry
Each plugin manifest lists the names of its hooks that have a server side in `serverHooks`. Each of those names must also be in the manifest's `hooks`. A name's server side comes from the plugin that wins the name, so an override with no server side removes it. When the admin saves, core checks the collection's `hooks` against the winning server-side names. If one matches, core calls `content/update` over RPC. If not, core calls the provider directly.

The client knows which hooks have a server side without loading any server code. There is no `tina-lock.json` flag for this.

### 4. The hooks wrap the content provider's server `update` op
At compose time, core wraps the `content` provider's server `update` op with the hook pipeline. The hooks live in the op itself, so every mount of that op runs them, including the extra mounts of a plugin that provides several singletons (`tinaCloud()` mounts as `content`, `media` and `auth`).

The op requires the `content:save` permission (ADR-008, ADR-014 §4). The default `editor` role holds it, so editors can save server-hooked collections (ADR-008 §5).

The provider's `update` takes only its input, as every op does. It reads the request through `requestContext()` from `tinacms/server`, which returns `{ request, session, authProvider }` for the op that is running, the way `use()` returns another capability. `tinaCloud()` uses the request to write with the token of the editor who saved. The accessor lives in a module that imports no node module, because a lazy `server` loader still lands in a browser build, and a `node:async_hooks` import there fails the barebones admin build.

A write that does not go through an RPC op, such as a webhook or a script that calls the provider directly, runs no hooks.

To find a collection's hooks, the RPC handler needs the config's `schema` (`mountHandler(config)`). `schema` is optional until a plugin registers a server hook. After that, a handler without it fails when it composes, on its first request.

### 5. `reject(message)` is how a hook talks to the editor
`reject(message)` is the only way a hook's message reaches the editor. It throws a `HookRejectedError`, and the Backend answers 422 with `{ error: { code: 'hook-rejected', message } }`. The provider is never called. The admin raises a `ContentError` with code `hook-rejected` that shows the hook's message, and the form stays dirty.

Any other throw is a generic 500 (`op-failed`, "Operation failed."). The message is kept out of the response body, so internal errors never reach the browser.

A successful save answers `{ entry, hookWarnings }`. An `afterSave` throw is logged and does not undo the save. Instead, `hookWarnings` gets one line per failed hook, and the admin raises the `AfterSaveHookError` that ADR-025 §6 defines.

### 6. No server runtime means no saves to server-hooked collections
A site with no server runtime has no Backend to run the hooks. A save to a server-hooked collection then fails with a `ContentError` with code `server-route-missing`: "This collection has server hooks, so it needs the site's server route." Core raises it when the route answers 404 or 405, answers with something other than JSON, or can't be reached. Core never falls back to a direct write, because that would skip the hooks without telling anyone.

### 7. Local dev runs the same hooks
When `localContentPlugin()` provides `content`, the Local Data Layer's Vite plugin serves `POST /api/tina/content/update` itself. It does not mount the RPC handler, which refuses every op without an auth plugin, and local dev usually runs without one. The route runs the same hook pipeline and then writes the file. When an auth plugin is installed, the route requires `content:save`. Without one, hooks receive a `null` session. A developer can test a server hook locally. Local dev is not the reason for this design. Production is.

### 8. Known gap: direct writes to TinaCloud skip the hooks
The editor's token can still write to TinaCloud directly. Until TinaCloud requires a project server secret for writes to hooked collections, a request written by hand straight to TinaCloud skips the hooks. Only the site server would hold that secret, never an editor.

An origin allowlist can't close the gap, because a client outside the browser can send any `Origin`. This ADR accepts the gap. A TinaCloud issue tracks the server secret.

## Consequences

### Positive
- A save rule written once runs on every Data Layer that has a Backend in front of it, TinaCloud included.
- Collections with no server hook pay nothing. Their saves skip the extra hop.
- Hooks get the verified session, so a rule can check roles.
- `reject()` gives the editor a clear reason, and other errors stay private.

### Negative
- Until TinaCloud enforces the server secret, server hooks guard saves made through the admin, not every possible write.
- A server-hooked collection needs a server runtime. A static-only site can't save to it.
- A slow hook slows every save to its collection.
- The site server makes the TinaCloud write with the editor's token.
- Next.js has no Vite step, so keeping `*.server.*` files out of the browser there relies on a rule, not the build (ADR-007).

## Alternatives Considered
- **Run hooks only in the Local Data Layer**: *rejected*. There is no one to enforce against locally. The rule has to hold in production.
- **Run hooks only in a Self-Hosted Data Layer**: *rejected*. TinaCloud sites get nothing, and the Self-Hosted Data Layer is not built.
- **Route every save through the Backend (ADR-018 path B)**: *rejected*. It adds a hop to every save, including collections with no server hook.

## References
- [CONTEXT.md](./CONTEXT.md): Document lifecycle hooks, Backend, Execution boundary, Session
- [ADR-007](./007-full-stack-plugins-client-backend-segments.md), [ADR-008](./008-authorization-permissions-roles.md), [ADR-014](./014-document-lifecycle-hooks.md), [ADR-015](./015-execution-boundary.md), [ADR-018](./018-save-flow.md), [ADR-025](./025-form-hook-registration.md)
- tinacms/tinacms#7740 (the issue)
