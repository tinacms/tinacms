# Architecture Overview

> **Canonical sources:** [CONTEXT.md](../CONTEXT.md) for terms; [ADR-001](../001-single-package-architecture.md), [ADR-002](../002-plugin-first-architecture.md), [ADR-006](../006-plugin-dependency-resolution.md), [ADR-007](../007-full-stack-plugins-client-backend-segments.md) for decisions. This page is orientation.

## Where each piece lives

There are three hosts in a v4 deployment, plus the package the user installs.

```
┌──────────────────────────────────────────────────────────────────┐
│ Browser                                                          │
│   Admin UI (Client segments + Zustand store + Form)              │
│         │                                                        │
│         │  ── content reads/writes (GraphQL) ────────────────┐   │
│         │                                                    ▼   │
│         │                                       ┌────────────────│
│         │                                       │ Data Layer     │
│         │  ── Capability RPC ──┐                │  • TinaCloud   │
│         ▼                      ▼                │  • Self-Hosted │
│ ┌────────────────────┐  ┌───────────────────┐   │  • Local       │
│ │ Backend (user's    │  │ Backend (user's   │   │                │
│ │ app server, e.g.   │  │ app server)       │   │ git lives      │
│ │ Next)              │  │                   │   │ INSIDE here    │
│ │   Server segments  │  │                   │   └────────────────│
│ └────────────────────┘  └───────────────────┘                    │
└──────────────────────────────────────────────────────────────────┘
```

- **Admin UI** runs in the browser. It holds the Zustand store and the active **Form**. It never touches files or git.
- **Data Layer** is the GraphQL content API. It is *one* of: TinaCloud (hosted), a Self-Hosted Data Layer, or a Local Data Layer (in-memory query index over on-disk files). Git operations (branch/commit/publish) live *inside* the Data Layer — they are not a client concern. ([ADR-004 amendment](../004-git-editorial-workflow.md), [CONTEXT.md ambiguity #4](../CONTEXT.md))
- **Backend** is the **user's own app server** (Next, Express, …). It is where plugin **Server segments** execute, mounted as routes by a thin per-framework adapter. It is *not* the Data Layer and *not* TinaCloud. ([ADR-007](../007-full-stack-plugins-client-backend-segments.md))
- **`tinacms` package** is single (ADR-001) but splits along the client/backend line via entry points. The client entry never imports backend code; per-framework adapters (`tinacms/next`, `tinacms/express`) mount the server-segment handler.

TinaCloud runs *no* plugin code: its capabilities (content read/write, image CDN) are first-party and fixed, so a third-party plugin trying to provide one is just a **Capability conflict** (ADR-006).

## How extensibility works

Everything user-facing is a **Plugin** (ADR-002). A plugin is a thin manifest:

```ts
definePlugin({
  name: 's3-media',
  provides: ['media'],
  dependsOn: ['auth'],
  client: () => import('./client'),  // React + Zustand slice → browser
  server: () => import('./server'),  // file/SDK/secret access → backend only
})
```

The two structural rules:

1. **Capability-keyed wiring.** `provides`/`dependsOn` reference **capability names**, never plugin names — implementations are swappable without touching dependents. The runtime topologically sorts plugins by capability. ([ADR-006](../006-plugin-dependency-resolution.md))
2. **Conflicts are a hard error.** Two plugins providing the same capability *at the same key* refuses to start; the only sanctioned override is an explicit `overrides: [...]` declaration. This closes silent plugin-hijack via load order. ([ADR-006](../006-plugin-dependency-resolution.md))

Two capability flavours:

- **Singleton capabilities** (`media`, `auth`, `search`, `content`): one provider.
- **Keyed capabilities** (`field`): many providers, one per *key*. The key is the schema field `type` (`string`, `image`, `rich-text`, `object`, …). Dozens are active at once; conflict means same capability *at the same key*. ([ADR-009](../009-field-plugins.md))

## How the client talks to the server

Four communication directions, all keyed on capability (full table in [ADR-007](../007-full-stack-plugins-client-backend-segments.md)):

| From → To | Mechanism |
|---|---|
| client → client | namespaced slice — `get().auth.user` |
| client → server | **Capability RPC** — `server.media.upload(...)` |
| server → server | in-process accessor — `use('auth')` |
| server → client | none in v4 core — request/response only |

**Capability RPC** is typed end-to-end by `import type` from the server segment — no codegen, no hand-written shared interface, and the type-only import erases at build so server code never enters the browser bundle. Lazy `client`/`server` segment references (`() => import('...')`) are what physically keep them separated.

## Authorization

Authorization is built into the RPC transport, not bolted on per plugin (ADR-008):

- **Secure by default.** The transport authenticates a session via the `auth` provider before dispatching to any operation. The only way to expose a public endpoint is the greppable `publicOp()` wrapper.
- **Permissions, not roles.** Operations gate on a typed `Permission` union (`'media:delete'`), aggregated by codegen from each plugin's declared permissions. Roles are bundles of permissions and live as runtime data with the `auth` provider — not in `defineConfig`, not in git.
- **Client checks are UX only.** The server transport is the sole enforcement.

## How fields and forms work

A **Form** is core editing state, scoped to one open document by `formId`. Field plugins are **stateless consumers** that read/write through hooks keyed by **Field address**. ([ADR-009](../009-field-plugins.md), [ADR-010](../010-form-state-model.md))

- **Field address** is the stable identity of a field instance — `blocks.<key>.cta.label`. Array segments use stable per-item keys, *never positional indices*, so an address survives reordering.
- **Composite fields delegate.** `object`, `list`, and rich-text never branch on a child's `type`; they resolve children through the runtime by capability key. Adding a field type touches zero lines of any composite.
- **Form state is flat and normalized by address** — values are `{ address: value }` with a separate structure index for child ordering. Leaf re-renders are O(1) and structurally isolated; editing one field never re-renders the tree.

**Visual editing** (click-to-edit) `postMessage`s a Field address across the preview iframe and sets it as the form's active field. Reveal (expand ancestors, scroll into view) is runtime-owned; activate (focus input, open popover) is field-owned via `useFieldActivation`.

## Where state lives

The Zustand store is **client-only** and composed **once at boot** from the static plugin list. Each client segment contributes a namespaced slice mounted under its capability key (`store.media`, `store.auth`). There is **no runtime `store.extend()`** and no action-wrapping. ([ADR-003 amendment](../003-zustand-state-management.md), [ADR-007](../007-full-stack-plugins-client-backend-segments.md))

Form state is the exception — it is *core* (not a per-plugin slice) and per-instance (created/destroyed as the editor navigates), so it lives in a flat address-keyed map outside the plugin slice composition. ([ADR-010](../010-form-state-model.md))

## What this means for the package

ADR-001 still holds: one `tinacms` install, no `@tinacms/cli` / `@tinacms/core` split. ADR-007 amends *how* it's structured:

- Subpath entry points cut the client/backend line (`tinacms`, `tinacms/server`, `tinacms/react`).
- Per-framework adapters (`tinacms/next`, `tinacms/express`, …) mount the runtime-composed server-segment handler.
- A full-stack plugin requires the deployment to *have* a server runtime (Next server / serverless). A purely static export has no host for server segments — open question tracked in CONTEXT.md.

## Related

- [Plugin System](./plugin-system.md) — definePlugin and segments in more detail
- [State Management](./state-management.md) — Zustand model and Form separation
- [ADR-007](../007-full-stack-plugins-client-backend-segments.md) — the central decision this overview is built on
