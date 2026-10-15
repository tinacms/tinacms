# Plugin System

> **Canonical sources:** [ADR-002](../002-plugin-first-architecture.md), [ADR-006](../006-plugin-dependency-resolution.md), [ADR-007](../007-full-stack-plugins-client-backend-segments.md), [ADR-009](../009-field-plugins.md); [CONTEXT.md](../CONTEXT.md) for **Plugin**, **Capability**, **Capability conflict**, **Keyed capability**, **Plugin segment**, **Capability RPC**.

A plugin is the **only** unit of extension in v4. There is no separate "module", "extension", or "addon" concept.

## The manifest

A plugin is a thin, fully-typed manifest. There is one `definePlugin` for every kind of plugin (no `defineFieldPlugin` / `defineMediaPlugin` / etc.) — a plugin's kind is expressed entirely through what it `provides`.

```ts
import { definePlugin } from 'tinacms'

definePlugin({
  name: 's3-media',              // unique identity of THIS plugin
  provides: ['media'],           // capabilities it satisfies
  dependsOn: ['auth'],           // capabilities it requires
  client: () => import('./client'),   // → React + Zustand slice (browser)
  server: () => import('./server'),   // → operations + secrets (backend)
  onInit?: (ctx) => …,           // plugin-lifecycle, called once
  onDestroy?: (ctx) => …,
  requires?: { permission: 'content:publish' },  // optional plugin-level gate
})
```

Lazy `() => import(...)` segment references are the bundle-safety mechanism: the client build statically follows `client` and never traverses `server`, so backend code physically cannot reach the browser. ([ADR-007](../007-full-stack-plugins-client-backend-segments.md))

## Capabilities

A **capability** is a named contract that plugins satisfy and depend on. `dependsOn` references the *capability*, never a plugin name — that is what makes implementations swappable:

```ts
// rich-text plugin
definePlugin({
  name: 'rich-text-field',
  provides: ['field'],
  dependsOn: ['media'],          // ← "I need *some* media provider", not "s3-media"
  client: () => import('./client'),
})
```

A single plugin may provide several capabilities (`tinacloud` provides `media` + `search` + `auth`); that is why `provides` is a list and there is no `type` field.

### Capability flavours

- **Singleton** (`media`, `auth`, `search`, `content`): one provider, one capability key. Default flavour.
- **Keyed** (`field`): many providers, one per key. The key is the value the provider handles (`field` is keyed by the schema field `type`). Dozens are active at once. ([ADR-009](../009-field-plugins.md))

### Conflict resolution

Two installed plugins providing the same capability *at the same key* is a **Capability conflict** and the runtime refuses to start, naming both providers. Load order never silently picks a winner. The only sanctioned override is an explicit declaration:

```ts
definePlugin({
  name: 'my-custom-image-field',
  provides: ['field'],
  overrides: [{ capability: 'field', key: 'image' }],   // intentionally replace built-in
  client: () => import('./client'),
})
```

`grep overrides` enumerates every intentional replacement in the project.

## Segments

A plugin contributes up to two **segments**, both lazy and both optional:

### Client segment (`defineClientPlugin`)

```ts
// client.ts
import { defineClientPlugin } from 'tinacms'

export default defineClientPlugin({
  // namespaced Zustand slice — mounted at store.media at boot
  slice: (set, get) => ({
    selected: null,
    select: (item) => set({ selected: item }),
  }),
  // UI surfaces this plugin contributes
  components: { MediaPicker },
})
```

The slice is composed into the store **once at boot** from the static plugin list, mounted namespaced under the capability key. There is **no `store.extend()` at runtime** and **no action-wrapping**. ([ADR-003 amendment](../003-zustand-state-management.md))

### Server segment (`defineServerPlugin`)

```ts
// server.ts
import { defineServerPlugin, protectedOp, publicOp } from 'tinacms/server'
import { S3 } from '@aws-sdk/client-s3'

const s3 = new S3({ region: process.env.AWS_REGION })

export default defineServerPlugin({
  async upload(input) { /* protected by default */ },
  delete: protectedOp({ permission: 'media:delete' }, async (input) => { … }),
  health: publicOp(async () => ({ ok: true })),   // greppable opt-out
})
```

The server segment is **framework-neutral** — it knows nothing about Next/Express. The runtime composes all server segments into one Web-standard `Request → Response` handler that thin per-framework adapters mount.

## Capability RPC

A client segment calls a server segment via **Capability RPC**:

```ts
// inside a React component or slice action
const result = await server.media.upload(file)
```

The `server.x.y(...)` proxy is typed end-to-end by **type-only inference** (the tRPC pattern):

- The server segment exports the type of its operations.
- The client imports it with `import type` — which TypeScript erases before bundling, so types cross the boundary with zero runtime cost and pull in none of the server's SDK/`process.env` code.
- The runtime value is a `Proxy` that turns a property path + argument into a single `fetch` to the mounted handler.
- No build/codegen step. Both segments live in the same plugin package, so `import type` resolves directly.

The transport authenticates the session before dispatching. Bare handlers are protected; `publicOp()` is the only way to opt out. See [ADR-008](../008-authorization-permissions-roles.md).

## Communication directions

| From → To | Mechanism |
|---|---|
| client → client | namespaced slice — `get().auth.user` |
| client → server | **Capability RPC** — `server.media.upload(...)` |
| server → server | in-process capability accessor — `use('auth')` |
| server → client | none in v4 core (request/response only) |

There is no event bus. The client subscribes to other plugins' slices by reading them; the server composes capabilities directly.

## Component resolution

A composite plugin (e.g. `object`, `list`, rich-text) renders *other* plugins' components through **Component resolution** — never by importing them or branching on a child's type:

```tsx
// inside the 'object' field plugin's Component
function ObjectField({ address, schema }) {
  return (
    <>
      {schema.fields.map((child) => (
        <Field
          key={child.name}
          address={`${address}.${child.name}`}   // address composes
          schema={child}
        />
      ))}
    </>
  )
}
```

The runtime resolves `<Field>` against the `field` capability at the child's type key. The composite owns *only* list/layout mechanics (add/remove/reorder/collapse); layout decisions read metadata the child declares — never `if (type === 'image') …`. Adding a field type touches zero lines of any composite. ([ADR-009](../009-field-plugins.md))

## Lifecycle and dependency resolution

The runtime topologically sorts plugins by their `dependsOn`/`provides` capability edges (the same algorithm the dropped module manager used, now keyed on capabilities). Plugins initialize in dependency order; `onDestroy` runs in reverse. Only plugins explicitly listed in `defineConfig({ plugins: [...] })` participate — a plugin cannot inject itself into the graph.

```ts
import { defineConfig } from 'tinacms'
import s3Media from '@tinacms/s3-media'
import algoliaSearch from '@tinacms/algolia-search'
import tinaCloud from '@tinacms/cloud'

export default defineConfig({
  plugins: [
    tinaCloud(),                       // provides: ['content', 'auth']
    s3Media({ bucket: '…' }),          // provides: ['media'], dependsOn: ['auth']
    algoliaSearch({ appId: '…' }),     // provides: ['search']
  ],
})
```

## What is *not* in the plugin system anymore

These appeared in pre-May docs and have been removed:

| Removed | Replacement |
|---|---|
| `defineFieldPlugin` / `defineMediaPlugin` / `defineAuthPlugin` / `defineFeaturePlugin` | one `definePlugin`, kind expressed by `provides` |
| `PluginDefinition.type` field | `provides: [...]` |
| `dependencies: ['plugin-name']` | `dependsOn: ['capability']` |
| `context.getPlugin('s3-media')` | namespaced slice (`get().media.*`) or RPC (`server.media.*`) |
| Module system (`TinaModule`, `ModuleManager`, `coreModule()`) | folded into plugin (`dependsOn` / `provides` / `onInit`) |
| Runtime `store.extend()` / `store.addMiddleware()` | boot-time composition from static plugin list |
| Event bus (`bus.on('document.save', …)`) | hooks-as-subscriptions ([ADR-010](../010-form-state-model.md)) |
| Auto-discovery of plugins from the filesystem | explicit `defineConfig({ plugins })` only |
| Plugin hot-reloading at runtime | not in v4 core |

## Related

- [Field Plugins](../plugins/field-plugins.md) — the keyed-capability case
- [Custom Plugins](../plugins/custom-plugins.md) — full-stack plugin example
- [State Management](./state-management.md) — slice composition
- [ADR-007](../007-full-stack-plugins-client-backend-segments.md) — the segment model
