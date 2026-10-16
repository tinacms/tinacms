# Public API

> **Canonical sources:** [Architecture Overview](../architecture/overview.md); [ADR-001](../001-single-package-architecture.md), [ADR-007](../007-full-stack-plugins-client-backend-segments.md), [ADR-002](../002-plugin-first-architecture.md).

The public API of `tinacms` for application developers. Plugin authors should also read [Internal APIs](./internal-apis.md).

## Installation

```bash
npm install tinacms
```

Single package per [ADR-001](../001-single-package-architecture.md). Per-framework adapters and the server-side surface are subpath exports — they ship inside the same package but are *not* imported by the client entry. ([ADR-007 amendment](../007-full-stack-plugins-client-backend-segments.md))

## Entry points

| Import path | Where it runs | Contains |
|---|---|---|
| `tinacms` | universal (config + types) | `defineConfig`, `defineCollection`, `definePlugin`, `t` schema helpers, `Permission` type |
| `tinacms/react` | browser | `TinaProvider`, `useTinaStore`, address-keyed hooks (`useFieldValue`, `useFieldAddress`, `useFieldActivation`, `useFieldErrors`, `useChildKeys`, `useSiblingValue`, `useFormActions`, `useHasPermission`) |
| `tinacms/client` | browser | client-segment authoring (`defineClientPlugin`), the `server` RPC proxy |
| `tinacms/server` | server only | `defineServerPlugin`, `protectedOp`, `publicOp`, `use(...)`, `mountHandler` |
| `tinacms/next`, `tinacms/express`, … | server only | per-framework adapters that mount the RPC handler |

The client entry never imports backend code; the `server`/adapter entries never end up in the browser bundle. Type-only crossings between segments use `import type`.

## `defineConfig`

```ts
import { defineConfig, defineCollection, t } from 'tinacms'
import { tinaCloud }       from '@tinacms/cloud'
import { s3Media }         from '@tinacms/s3-media'
import { algoliaSearch }   from '@tinacms/algolia-search'
import { editorialWorkflow } from './plugins/editorial-workflow'

export default defineConfig({
  plugins: [
    tinaCloud(),                            // provides: ['content', 'auth']
    s3Media({ bucket: '…', region: '…' }),  // provides: ['media']
    algoliaSearch({ appId: '…' }),          // provides: ['search']
    editorialWorkflow(),                    // provides: [], dependsOn: ['content', 'auth']
  ],

  schema: {
    collections: [
      defineCollection({
        name: 'post',
        label: 'Blog Posts',
        path: 'content/posts',
        format: 'mdx',
        fields: [
          t.string({ name: 'title', label: 'Title', required: true }),
          t.string({ name: 'body', label: 'Body', ui: { component: 'rich-text' } }),
        ],
      }),
    ],
  },

  // Optional: middleware injected into the static store composition
  middleware: [/* … */],

  // Optional: persist subset / storage backend overrides
  store: { persist: { name: 'tina-store' } },

  // Optional: branch preview URL pattern
  branchPreview: (branch, path) =>
    branch === 'main' ? `${SITE}/${path}` : `${SITE}/preview/${branch}/${path}`,
})
```

Notes:

- **`plugins` is the only registration mechanism.** No `modules` array — the module system was removed ([ADR-006](../006-plugin-dependency-resolution.md)).
- **Built-in providers are still plugins.** A bare `defineConfig({ schema })` with no plugins won't work — at minimum you need one provider for `content` (and usually `auth`, often bundled as `tinaCloud()` provides both).
- **No `modules: [...]` and no auto-discovery.** Only what's in `plugins:` participates.

## `definePlugin`

The single plugin manifest. See [Plugin System](../architecture/plugin-system.md) and [Custom Plugins](../plugins/custom-plugins.md).

```ts
import { definePlugin } from 'tinacms'

definePlugin({
  name: 'my-plugin',
  provides: ['some-capability'],
  dependsOn: ['auth'],
  client: () => import('./client'),
  server: () => import('./server'),
  permissions: [{ name: 'my:thing', description: '…' }],
  requires: { permission: 'content:publish' },   // optional plugin-level gate
})
```

There is **no** `defineFieldPlugin` / `defineMediaPlugin` / `defineAuthPlugin` / `defineFeaturePlugin`. A plugin's kind is expressed by `provides`.

## `defineCollection` and `t.*`

Schema-side helpers (unchanged in spirit from v2, but evaluated against the new plugin model):

```ts
defineCollection({
  name, label, path, format,           // 'md' | 'mdx' | 'json' | 'yaml'
  fields: [
    t.string({ name, label, required, min, max, pattern, ui: { component: 'rich-text' } }),
    t.number({ name, label, min, max, step }),
    t.boolean({ name, label }),
    t.datetime({ name, label }),
    t.object({ name, label, fields: [...] }),
    t.list({ name, label, itemField: t.string({ name: 'item' }) }),
    t.reference({ name, label, collections: ['post'] }),
    // … and custom field types registered via field plugins
  ],
})
```

The `ui.component` value names the **`field` capability key** to render. Custom field types are added by registering a `field` plugin at that key — see [Field Plugins](../plugins/field-plugins.md).

## React API (`tinacms/react`)

### Provider

```tsx
import { TinaProvider } from 'tinacms/react'

<TinaProvider config={tinaConfig}>
  {/* … */}
</TinaProvider>
```

### Store hook

```ts
import { useTinaStore } from 'tinacms/react'

const user = useTinaStore((s) => s.auth.user)
const current = useTinaStore((s) => s.branch.current)
```

### Field hooks (inside field plugin Components)

| Hook | Subscription |
|---|---|
| `useFieldAddress()` | identity of *this* field |
| `useFieldValue<T>(address)` | one leaf value (stable reference) |
| `useFieldErrors(address)` | errors at an address |
| `useFieldActivation(handler)` | opt-in callback when this field becomes active |
| `useSiblingValue(address, name)` | sibling leaf |
| `useChildKeys(address)` | ordered child keys at a composite address |
| `useFormActions()` | atomic structural ops (`addItem`, `removeItem`, `moveItem`, `duplicateItem`) |

See [Field Plugins](../plugins/field-plugins.md) for usage.

### Permission UX hook

```ts
import { useHasPermission } from 'tinacms/react'

const canDelete = useHasPermission('media:delete')   // UX only — server is enforcement
```

## Server API (`tinacms/server`)

For plugin authors writing server segments:

```ts
import { defineServerPlugin, protectedOp, publicOp, use } from 'tinacms/server'
```

| Symbol | Role |
|---|---|
| `defineServerPlugin` | Declare a plugin's server segment |
| `protectedOp({ permission })` | Wrap an op to require a permission |
| `publicOp()` | Greppable opt-out for unauthenticated endpoints |
| `use('cap')` | In-process accessor for another capability's server segment |
| `mountHandler` | Internal — used by per-framework adapters |

## Per-framework adapters

```ts
// app/api/tina/[...slug]/route.ts (Next.js App Router)
import { mountHandler } from 'tinacms/next'
import config from '../../../../tina.config'

export const { GET, POST } = mountHandler(config)
```

The adapter mounts the runtime-composed server-segment handler (all server segments + RPC transport). Express, Hono, Remix, etc. have equivalent adapters.

## Stability

All `tinacms` exports follow semver. Anything documented under `tinacms/server` is part of the public plugin-author contract; anything under a future `tinacms/internal` (if introduced) is not.

## Related

- [Internal APIs](./internal-apis.md) — plugin-author contracts in depth
- [Plugin System](../architecture/plugin-system.md)
- [Field Plugins](../plugins/field-plugins.md) — `tinacms/react` hooks in context
