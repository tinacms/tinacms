# Single Package

> **Canonical sources:** [ADR-001](../001-single-package-architecture.md) (amended by ADR-007).
>
> **Naming note.** This page used to be called "Single Package Refactor" — v4 is a **rewrite**, not a refactor of v2, so the file lives here for backward link compatibility but the framing is about the v4 package shape, not a code migration.

## Why one package

v2 ships seven coordinated packages (`tinacms`, `@tinacms/core`, `@tinacms/cli`, `@tinacms/app`, `@tinacms/ui`, `@tinacms/search`, `@tinacms/richtext`). The split makes installation, version coordination, documentation, and onboarding worse without buying real modularity in return.

v4 ships **one** package:

```bash
npm install tinacms
```

Per [ADR-001](../001-single-package-architecture.md).

## How "single package" stays compatible with client/backend separation

[ADR-007](../007-full-stack-plugins-client-backend-segments.md) added a hard rule: backend code must never reach the browser bundle. The single package satisfies that with **subpath entry points**, not a package split:

| Entry | Where it runs |
|---|---|
| `tinacms` | universal (config, types) |
| `tinacms/react` | browser |
| `tinacms/client` | browser (plugin client-segment authoring + RPC proxy) |
| `tinacms/server` | server only (plugin server-segment authoring + transport) |
| `tinacms/next`, `tinacms/express`, … | server only (per-framework adapters) |

The client entry never imports backend code. Within plugins, the manifest references segments lazily (`server: () => import('./server')`) so the bundler statically follows the client path and ignores the server path — neither the bundler nor the runtime needs a separate package to enforce the line.

## Tree-shaking guarantees

- Per-framework adapters are gated behind their subpath import — a Next app pulls `tinacms/next` only.
- Built-in providers (`localMedia`, `localSearch`, …) are individually-importable so a TinaCloud-only deployment doesn't ship local-only code.
- The Zustand store composes only from the slices contributed by the plugins in `defineConfig`. Unused plugins don't contribute slices and don't ship.

## What "single package" does *not* mean

- It does **not** mean a god-module. Internal organization still matters; the structure inside `tinacms/src/` mirrors the ADR-set (core runtime, RPC transport, store composer, built-in plugins, codegen, react bindings, framework adapters).
- It does **not** mean every Tina-adjacent integration is in the package. Provider plugins (e.g. `@tinacms/s3-media`, community Algolia/Cloudinary plugins) remain separate packages — that is what the full-stack plugin model is *for*.
- It does **not** mean the CLI is a separate package. `tina dev`, `tina build`, `tina codegen`, `tina permissions` are commands inside `tinacms`.

## Internal layout (sketch)

```
tinacms/
├── package.json                  # exports map → subpath entries (./react, ./client, ./server, ./next, …)
└── src/
    ├── index.ts                  # universal entry — defineConfig, definePlugin, t, types
    ├── core/                     # plugin runtime + capability resolution
    ├── rpc/                      # Capability RPC transport + Proxy client + auth wrappers (ADR-007/008)
    ├── store/                    # boot-time slice composer + core slices (ui/branch/documents)
    ├── form/                     # flat-by-address Form store (ADR-010)
    ├── client/                   # `tinacms/client` — defineClientPlugin + server RPC proxy
    ├── server/                   # `tinacms/server` — defineServerPlugin + protectedOp/publicOp/use
    ├── admin/                    # admin shell UI
    ├── codegen/                  # schema → types/client; permissions → typed `Permission` union
    ├── cli/commands/             # tina dev / build / codegen / permissions
    ├── plugins/
    │   ├── local-content/        # Local Data Layer
    │   ├── local-auth/ local-media/ local-search/
    │   └── fields/{string,object,list,image,rich-text,reference,datetime,boolean,number,select}/
    └── adapters/                 # host-framework integrations (both client- and server-side)
        ├── react/                # `tinacms/react` — browser provider + address-keyed hooks
        ├── next/ express/ astro/ hono/   # server-side RPC handler mounts
```

`adapters/` covers both client-rendering (`react`) and server-routing (`next`/`express`/`astro`/`hono`) framework integrations — a Next project consumes `tinacms/react` *and* `tinacms/next` together. The client/server split is enforced by the `exports` map + the lazy segment imports inside each plugin manifest, not by the directory tree.

## Related

- [ADR-001](../001-single-package-architecture.md), [ADR-007](../007-full-stack-plugins-client-backend-segments.md)
- [Public API](../api/public-api.md) — the user-facing entry-point shape
