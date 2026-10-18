# ADR-007: Full-Stack Plugins with Client/Backend Segments

## Status
**Accepted** — builds on [ADR-002](./002-plugin-first-architecture.md) and [ADR-006](./006-plugin-dependency-resolution.md); amends [ADR-001](./001-single-package-architecture.md), [ADR-003](./003-zustand-state-management.md), and [ADR-004](./004-git-editorial-workflow.md).

## Context
"Everything is a plugin" (ADR-002) collides with a hard fact the original docs never drew: there is a **client/backend boundary**. The Admin UI runs in a browser; it cannot touch the filesystem, hold secrets, or call write-scoped third-party APIs. Yet most CMS substance — saving content, uploading media, verifying auth, indexing search — *must* run server-side.

Two models were on the table:
- **Client-only plugins**, with the backend a fixed contract configured separately ("World B").
- **Full-stack plugins**, where one plugin contributes both a client segment and a backend segment ("World A").

The deciding factor was **shareability**: a community author can publish a complete integration (e.g. Cloudinary) as a single `npm install` + one config line. World B fragments every integration into "install a client plugin *and* separately configure the backend," which is a worse ecosystem story — and the OSS/self-hosted community is exactly where sharing matters.

## Decision
A plugin is **full-stack**. It is a thin manifest that lazily references up to two segments:

```ts
definePlugin({
  name: 's3-media',
  provides: ['media'],
  dependsOn: ['auth'],
  client: () => import('./client'),   // React/UI + Zustand slice → browser bundle
  server: () => import('./server'),   // server ops + secrets     → never in browser
})
```

### Segments
- **Client segment** (`defineClientPlugin`): contributes a namespaced Zustand slice and UI components. Composed into the store **once at boot** from the static plugin list (not mutated at runtime), mounted under the capability key (`store.media`, `store.auth`).
- **Server segment** (`defineServerPlugin`): pure, framework-neutral operations that implement the plugin's capabilities. Holds secrets, touches files/APIs. Note: "server" is the plugin's server-side segment; the **Backend** is the *host* that runs it.

### Communication (four directions, all keyed on capability)
| From → To | Mechanism |
|---|---|
| client → client | namespaced slice access — `get().auth.user` |
| client → server | **Capability RPC** — `server.media.upload(...)`, typed from the server's exported shape |
| server → server | in-process capability accessor — `use('auth')` |
| server → client | none in v4 core — request/response only; the server returns values |

### Lazy segments are the bundle-safety mechanism
`client`/`server` are lazy `() => import()` references, not inline objects. The client build statically follows `client` and never traverses `server`, so Node code and secrets physically cannot reach the browser. This is what makes ADR-001's single-package tree-shaking promise actually hold for server code.

### Type-safe RPC without codegen
The client→server `server.x.y(...)` proxy is typed end-to-end by **type-only inference** (the tRPC pattern), not a generated client:
- The server segment exports the *type* of its operations; the client imports it with `import type` — which the TS compiler **erases** before bundling, so it carries types across the boundary with zero runtime and pulls in none of the server's `@aws-sdk`/`process.env` code.
- The client proxy is a recursive mapped type `RpcProxy<TServer>` that turns each `(input) => Promise<R>` into the same client call signature; the runtime value is a `Proxy` that turns a property path + argument into a single `fetch` to the mounted handler.
- No build/codegen step is required because both segments live in the same plugin package (same TS project), so `import type` resolves directly.
- Sub-decision: binary/non-JSON payloads (file uploads, `Date`, `Map`) need a serialization story. **Binary/file-upload resolved by [ADR-022](./022-media-capability-contract.md):** it is *scoped to the `media` capability* (presigned-direct upload, multipart fallback), so the general RPC transport stays **JSON-only**. *Still open:* a superjson-style codec for rich JSON (`Date`, `Map`) in ordinary RPC payloads.

### Framework neutrality
A server segment knows nothing about its host. The runtime composes all server segments into one Web-standard `Request → Response` handler; thin per-framework adapters mount it (`tinacms/next`, `tinacms/express`, …). The same handler runs under Next/Remix/Express on the user's **Backend**.

### Where server segments run (and where they don't)
Terminology (corrected — see CONTEXT.md): the **Backend** is the *user's app server* (the Next server), where server segments execute as routes. The **Data Layer** (GraphQL content API) is a separate thing; **TinaCloud** is the hosted Data Layer (+ image CDN) and runs *no* plugin code.

So a server segment runs on the user's Backend — **never** on TinaCloud. This is not a limitation: plugin server code was never meant to run on TinaCloud, and the user's Next server is always present to host it. TinaCloud only ever serves content (Data Layer); a third-party plugin trying to provide one of TinaCloud's fixed capabilities is just a **Capability conflict** (ADR-006).

The one real constraint: a server segment requires the deployment to *have* a server runtime (Next server / serverless functions). A **purely static export** has none — so full-stack plugins imply "deploy with a server runtime," and static-only sites are limited to client-only plugins. (Open: whether to offer any hosting story for static sites — tracked in CONTEXT.md.)

## Consequences

### Positive
- "Everything is a plugin" holds literally and full-stack integrations ship as one artifact.
- Per-plugin authoring stays small (manifest + two files); the framework/adapter complexity is paid once by Tina, not by each author.
- Bundle leakage and the "Zustand can't add middleware after create / persist can't see runtime slices" problems (ADR-003) both disappear: segments are lazy, slices are composed once at boot.
- Types cross the client/backend boundary by inference — no hand-written shared interface.

### Negative
- The runtime carries segment composition + per-framework adapters.
  - Paid once, centrally.
- Full-stack plugins don't run on managed TinaCloud.
  - Made loud at config time via the `backend`-key declaration; TinaCloud's first-party providers cover the common cases.

### Amendments to prior ADRs
- **ADR-001:** the single `tinacms` package splits along the client/backend line via entry points; the client entry never imports backend code. Per-framework adapter entry points (`tinacms/next`, …) are added.
- **ADR-003:** the store is client-only and composed once at boot from the static plugin list; the runtime `store.extend()` / `addMiddleware()` sketches are dropped.
- **ADR-004:** git operations (branch/commit/publish) are an implementation detail *inside* the **Data Layer** (GitHub sync engine for TinaCloud; git for a Self-Hosted Data Layer) — not a client concern and not shelled out from the Admin UI.

## References
- [CONTEXT.md](./CONTEXT.md) — Plugin segment, Capability RPC, TinaCloud
- [ADR-002](./002-plugin-first-architecture.md), [ADR-006](./006-plugin-dependency-resolution.md)
</content>
