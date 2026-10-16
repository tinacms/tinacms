# Middleware

> **Canonical sources:** [ADR-003](../003-zustand-state-management.md) (amended by ADR-007), [ADR-007](../007-full-stack-plugins-client-backend-segments.md).

The store's middleware stack is **fixed at `create()` time**. Because the plugin list is static, there is no runtime middleware-add API — the stack is composed once at boot from the core's defaults plus any middleware contributed via `defineConfig`.

## Built-in middleware

The default stack (outermost → innermost):

```
devtools → persist → (composed slices)
```

### `devtools`

Redux DevTools integration. Active in development; tree-shaken from production builds.

```ts
import { devtools } from 'zustand/middleware'

devtools(inner, { name: 'TinaStore' })
```

### `persist`

Standard Zustand persist. The `partialize` selector picks the durable subset (session, theme, sidebar) and skips volatile state (form values, media list). Per-plugin contributions are aggregated by the composer — see [Persistence](./persistence.md).

```ts
import { persist } from 'zustand/middleware'

persist(inner, {
  name: 'tina-store',
  partialize: pickPersistableFields,
})
```

## Adding middleware

Middleware is contributed at config time, not at runtime:

```ts
import { defineConfig } from 'tinacms'

export default defineConfig({
  plugins: [ … ],
  middleware: [loggerMiddleware, errorMiddleware],   // composed into the static stack
})
```

The runtime wraps these around the inner store creator in the order given. Because composition happens at `create()` time, you can use any standard Zustand middleware (`subscribeWithSelector`, `immer`, …) — the only constraint is *when* you can add it.

### Custom logging middleware

```ts
const loggerMiddleware = (inner) => (set, get, api) =>
  inner(
    (...args) => {
      console.log('[Store] before:', get())
      set(...args)
      console.log('[Store] after:', get())
    },
    get,
    api,
  )
```

## What you can't do

- **No `store.addMiddleware(...)` at runtime.** The Zustand middleware contract is "compose at create"; layering after creation isn't supported. This isn't a Tina limitation — it's a Zustand one. ([ADR-003 amendment](../003-zustand-state-management.md))
- **No middleware on the server side.** The store is client-only. Server-side cross-cutting concerns belong in the RPC transport (authentication, logging) or in `use('cap')` composition. ([ADR-007](../007-full-stack-plugins-client-backend-segments.md), [ADR-008](../008-authorization-permissions-roles.md))
- **No subscription-based action wrapping.** Don't wrap `set` to "react to a different slice's action" — subscribe to that slice with `useTinaStore.subscribe((s) => s.x.y, handler)` instead.

## Related

- [Store Architecture](./store-architecture.md)
- [Extensibility](./extensibility.md)
- [Persistence](./persistence.md)
- [ADR-003](../003-zustand-state-management.md), [ADR-007](../007-full-stack-plugins-client-backend-segments.md)
