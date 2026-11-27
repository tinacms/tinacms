# ADR-028: Server Save Hooks

## Status
**Proposed** (2026-10-21). Supersedes [ADR-018](./018-save-flow.md) §1 for server-hooked collections only. Saves to every other collection stay on ADR-018 path A. Amends [ADR-025](./025-form-hook-registration.md) §1 and §7, and [ADR-008](./008-authorization-permissions-roles.md) §5 (the default `editor` role holds `content:save`). Builds on [ADR-007](./007-full-stack-plugins-client-backend-segments.md) (segments, Capability RPC), [ADR-008](./008-authorization-permissions-roles.md) (enforcement), [ADR-014](./014-document-lifecycle-hooks.md) §3 (server `beforeSave` enforces) and [ADR-015](./015-execution-boundary.md) (what runs where).

Amended (#8086): a collection with a custom validator also saves through the Backend, and the Backend runs the collection's validators before the server hooks (§9).

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
import { defineServerHook, reject } from '@tinacms/tinacms/server';

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
A **server-hooked collection** lists at least one hook with a server side. A collection with a field that lists a custom validator (§3) is a server-hooked collection too, even with no hook. A save to it takes this path:

```text
post (server hook or custom validator):    Browser ──▶ Backend RPC content/update ── getSession ── validators ── beforeSave ── write ── afterSave ──▶ provider
tag  (no server hook, no custom validator): Browser ──────────────────────────────────────────────────────────────────────────────────────────▶ provider
```

1. The browser calls `content/update` on the site's Backend over Capability RPC (`POST /api/tina/content/update`).
2. The transport calls `getSession` to authorize the request. The hooks reuse that session, so it is fetched once per save.
3. The validators that the collection's fields list run against the document (§9). If one fails, no server `beforeSave` hook runs and nothing is written.
4. The server `beforeSave` hooks run as a pipeline, in the collection's order (ADR-025 §3). Each one receives the previous one's output.
5. The content provider's `update` writes the result.
6. The server `afterSave` observers run.

A hook in the collection's list that has no server side is client only, and the server skips it.

Every other save goes straight to the content provider, as ADR-018 path A says.

### 3. Core routes the save from the hook registry
Each plugin manifest lists the names of its hooks that have a server side in `serverHooks`. Each of those names must also be in the manifest's `hooks`. A name's server side comes from the plugin that wins the name, so an override with no server side removes it. When the admin saves, core checks the collection's `hooks` against the winning server-side names. If one matches, core calls `content/update` over RPC. If not, core calls the provider directly.

The client knows which hooks have a server side without loading any server code. There is no `tina-lock.json` flag for this.

Core also routes from the validator registry. A **custom validator** is a validator name that the core validators plugin does not win. A collection routes through `content/update` when a field at any depth lists a custom validator. A field at any depth includes a field of an object, an item of a list and a field of every template. The four built-in validators (`required`, `min`, `max`, `pattern`) alone do not route a save. An override of a built-in name makes that name custom.

### 4. The validators and the hooks wrap the content provider's server `update` op
At compose time, core wraps the `content` provider's server `update` op with the validators (§9) and the hook pipeline. They live in the op itself, so every mount of that op runs them, including the extra mounts of a plugin that provides several singletons (`tinaCloud()` mounts as `content`, `media` and `auth`).

The op requires the `content:save` permission (ADR-008, ADR-014 §4). The default `editor` role holds it, so editors can save server-hooked collections (ADR-008 §5). It also requires every permission that the provider's own `update` declared with `protectedOp`. A provider `update` marked `publicOp` still requires `content:save`, because a save is never public.

The provider's `update` takes only its input, as every op does. It reads the request through `requestContext()` from `@tinacms/tinacms/server`, which returns `{ request, session, authProvider }` for the op that is running, the way `use()` returns another capability. `tinaCloud()` uses the request to write with the token of the editor who saved. The accessor lives in a module that imports no node module, because a lazy `server` loader still lands in a browser build, and a `node:async_hooks` import there fails the barebones admin build.

A write that does not go through an RPC op, such as a webhook or a script that calls the provider directly, runs no validators and no hooks.

On the Local Data Layer, a save must target the collection that owns the file: the deepest collection folder whose format matches it. Core checks that before any hook runs, and passes the hooks the canonical repo-relative path.

To find a collection's hooks, the RPC handler needs the config's `schema` (`mountHandler(config)`). `schema` is optional until a plugin registers a server hook or a custom validator. After that, a handler without it fails when it composes, on its first request.

### 5. `reject(message)` is how a hook talks to the editor
`reject(message)` is the only way a hook's message reaches the editor. It throws a `HookRejectedError`, and the Backend answers 422 with `{ error: { code: 'hook-rejected', message } }`. The provider is never called. The admin raises a `ContentError` with code `hook-rejected` that shows the hook's message, and the form stays dirty.

A provider's own write can refuse a save with a known content error. It answers with that code and the provider's user-facing message, and the admin raises a `ContentError` with the same code:

| Status | Codes |
|---|---|
| 401 | `unauthorized` |
| 403 | `forbidden` |
| 422 | `not-found`, `branch-not-found`, `not-indexed`, `validation` |
| 502 | `network` |

A failed validator answers 422 with `{ error: { code: 'validation', message, fieldErrors } }`. `fieldErrors` maps each field address to its messages, in the address form the form uses (`authors.0.alias`). The admin raises a `ContentError` with code `validation` and those field errors. It shows each message on its field and keeps the form dirty. A validator that throws, or returns something other than a message, a list of messages or `null`, is a generic 500, like any other throw.

Any other throw is a generic 500 (`op-failed`, "Operation failed."). The message is kept out of the response body, so internal errors never reach the browser.

A successful save answers `{ entry, hookWarnings }`. An `afterSave` throw is logged and does not undo the save. Instead, `hookWarnings` gets one line per failed hook, and the admin raises the `AfterSaveHookError` that ADR-025 §6 defines.

### 6. No server runtime means no saves to server-hooked collections
A site with no server runtime has no Backend to run the hooks. A save to a server-hooked collection then fails with a `ContentError` with code `server-route-missing`: "This collection runs checks on the site's server, so it needs the site's server route." This includes a collection that is server-hooked only because of a custom validator. Core raises it when the route answers 404 or 405, or answers with something other than JSON. A fetch that fails before any answer, such as when the browser is offline or DNS fails, raises `network` instead. Core never falls back to a direct write, because that would skip the hooks without telling anyone.

### 7. Local dev runs the same hooks
When `localContentPlugin()` provides `content`, the Local Data Layer's Vite plugin serves `POST /api/tina/content/update` itself. It does not mount the RPC handler, which refuses every op without an auth plugin, and local dev usually runs without one. The route runs the same validators and the same hook pipeline, and then writes the file, inside the same runtime and request contexts as a dispatched op, so a hook can call `use()` and `requestContext()` there too. It does not run plugins' `onInit`. `use('content').update` there is the provider's raw op, without the hook wrapper, because the Local Data Layer is not a mounted server segment. When an auth plugin is installed, the route requires `content:save`. Without one, hooks receive a `null` session. A developer can test a server hook locally. Local dev is not the reason for this design. Production is. The Local Data Layer's own content endpoint, which the local `content` provider calls for a collection that is not server-hooked, runs the same pipeline. So in local dev every save runs the validators, and a refused save shows its messages on the fields.

### 8. Known gap: direct writes to TinaCloud skip the hooks and validators
The editor's token can still write to TinaCloud directly. Until TinaCloud requires a project server secret for writes to hooked collections, a request written by hand straight to TinaCloud skips the hooks. Only the site server would hold that secret, never an editor.

An origin allowlist can't close the gap, because a client outside the browser can send any `Origin`. This ADR accepts the gap. A TinaCloud issue tracks the server secret.

The same gap holds for validators. A direct write to TinaCloud runs no custom validator and no built-in validator.

### 9. Validators run on the Backend before the hooks
A validator plugin's server segment holds one `ValidatorFactory` for each name its manifest declares in `validators`, under the reserved `validators` key. The key is never routed as an op. The core validators plugin does the same for `required`, `min`, `max` and `pattern`. A declared name with no server factory fails when the handler composes. A server factory comes from the plugin that wins the name, as a server hook does (§3).

On a save through the Backend, the validators run after `getSession`, after core resolves the path and the branch, and before the first server `beforeSave` hook. The form validates before the client `beforeSave` hooks, and the Backend validates after them, so a client hook that changes a value can make the Backend refuse a save that the form allowed. They run on every field the collection lists, at every depth, with the same rules as the form. A hidden, disabled or read-only field is skipped. A rule gets the same `{ node, address, siblings, values }` context as in the form.

The validators read the document the browser sent. That is the value after the client `beforeSave` hooks, in its stored form, not the editor's value: a number field holds `5`, not `'5'`, and a rich-text field holds its Markdown source. `siblings` and `values` hold stored values too. A field type whose stored value differs from its editor value declares on its manifest how `required`, `min` and `max` read the stored value. A custom validator that reads a value must accept both forms.

If any validator returns a message, nothing is written and no server `beforeSave` hook runs.

These saves do not run the validators on the Backend:
- A save to a collection that saves straight to a remote provider, such as TinaCloud. Its built-in validators run only in the form. The Local Data Layer is the exception (§7).
- A write to a hidden, disabled or read-only field. The Backend skips that field.
- A new document on a Backend whose content provider has no server `create` op. That save fails with `server-route-missing` (§6).
- Save to new branch. It writes through the branch provider, not through `content/update`, so it also skips the server hooks.
- A direct write to TinaCloud (§8).

## Consequences

### Positive
- A save rule written once runs on every Data Layer that has a Backend in front of it, TinaCloud included.
- Collections with no server hook and no custom validator pay nothing. Their saves skip the extra hop.
- Hooks get the verified session, so a rule can check roles.
- `reject()` gives the editor a clear reason, and other errors stay private.
- A custom validator holds at the write on every Data Layer that has a Backend in front of it, TinaCloud included.

### Negative
- Until TinaCloud enforces the server secret, server hooks guard saves made through the admin, not every possible write.
- A server-hooked collection needs a server runtime. A static-only site can't save to it.
- A slow hook slows every save to its collection.
- The site server makes the TinaCloud write with the editor's token.
- Next.js has no Vite step, so keeping `*.server.*` files out of the browser there relies on a rule, not the build (ADR-007).
- A collection with a custom validator needs a server runtime. A static site that uses one cannot save to that collection.
- A collection with a custom validator cannot create documents through a Backend whose content provider has no server `create` op, such as `tinaCloud()`.
- Every validator plugin ships a server segment. A plugin without one stops the whole RPC handler from composing.
- A custom validator reads the stored value on the Backend and the editor value in the form.
- A collection with only built-in validators and no server hook is still checked only in the form, except on the Local Data Layer.

## Alternatives Considered
- **Run hooks only in the Local Data Layer**: *rejected*. There is no one to enforce against locally. The rule has to hold in production.
- **Run hooks only in a Self-Hosted Data Layer**: *rejected*. TinaCloud sites get nothing, and the Self-Hosted Data Layer is not built.
- **Route every save through the Backend (ADR-018 path B)**: *rejected*. It adds a hop to every save, including collections with no server hook.

## References
- [CONTEXT.md](./CONTEXT.md): Document lifecycle hooks, Backend, Execution boundary, Session
- [ADR-007](./007-full-stack-plugins-client-backend-segments.md), [ADR-008](./008-authorization-permissions-roles.md), [ADR-014](./014-document-lifecycle-hooks.md), [ADR-015](./015-execution-boundary.md), [ADR-018](./018-save-flow.md), [ADR-025](./025-form-hook-registration.md)
- tinacms/tinacms#7740 (the issue)
