# Store Extensibility

> **Canonical sources:** [ADR-003](../003-zustand-state-management.md) (amended by ADR-007), [ADR-007](../007-full-stack-plugins-client-backend-segments.md), [ADR-010](../010-form-state-model.md).

The store is extended by **contributing a client segment slice at boot**. There is no runtime extension API.

## How a plugin contributes state

A plugin's client segment declares its slice. The runtime composes it into the store under a namespace at boot:

```ts
// client.ts
import { defineClientPlugin, server } from 'tinacms'

export default defineClientPlugin({
  slice: (set, get) => ({
    items: [],
    selected: null,

    async load(path: string) {
      const r = await server.media.list({ path })
      set({ items: r.items })
    },

    select(item) { set({ selected: item }) },
  }),

  components: { MediaPicker },

  // optional: subset to persist
  persist: (slice) => ({ selected: slice.selected }),
})
```

### Namespace

- Plugins providing a **singleton capability** mount under that capability key — `media`, `auth`, `search`. Two plugins providing the same singleton is a **Capability conflict** ([ADR-006](../006-plugin-dependency-resolution.md)).
- Plugins that **don't provide a singleton capability** (e.g. a feature plugin like `editorial-workflow`, or a plugin providing a keyed capability where the slice belongs to the plugin not the key) mount under their plugin name.
- **Field plugins** (keyed capability `field`) contribute no slice — Form state is core ([ADR-010](../010-form-state-model.md)).

## Reading another plugin's slice

Cross-plugin reads go through the namespace:

```ts
slice: (set, get) => ({
  publish: async () => {
    const user = get().auth.user                  // reading the auth plugin's slice
    if (!user) throw new Error('unauthenticated')
    const current = get().branch.current
    await server['editorial-workflow'].requestPublish({ branch: current })
  },
})
```

This is the **client → client** communication channel ([ADR-007](../007-full-stack-plugins-client-backend-segments.md)). Because slices mount at capability keys, swapping providers (e.g. `tinaCloudAuth()` for `auth0Auth()`) leaves consumers unchanged.

## Calling a server segment

The **client → server** channel is **Capability RPC**, not a slice action:

```ts
slice: (set, get) => ({
  async upload(file: File, path: string) {
    const r = await server.media.upload({ file, path })   // typed RPC
    set((s) => ({ items: [r, ...s.items] }))
  },
})
```

## What you can't do

| Pattern | Why it's gone |
|---|---|
| `context.store.extend((set) => ({...}))` at runtime | Slices compose at boot; the plugin list is static ([ADR-003 amendment](../003-zustand-state-management.md)) |
| `context.store.addMiddleware(loggingMiddleware)` | Middleware stack is fixed at `create()` time ([Middleware](./middleware.md)) |
| Wrapping an action — `setState({ login: wrapped })` | Composition is server-side via `use('cap')`, not client-side monkey-patching. If you want to "react to auth login," subscribe with `useTinaStore.subscribe((s) => s.auth.user, …)` from your own slice's setup. |
| Emitting events on a bus | No bus. Other slices read your state directly; server segments compose via `use('cap')`. |
| Storing per-field state in a slice | Forms are core; field plugins hold no persistent slice ([ADR-010 §1](../010-form-state-model.md)) |

## When a feature truly needs to react to another plugin

Use **`use('cap')` in your server segment**, not action wrapping in the client.

```ts
// server.ts of an audit-log plugin
import { defineServerPlugin, use } from 'tinacms/server'

export default defineServerPlugin({
  async onContentWrite(input: { document: string }) {
    const auth = use('auth')
    const session = await auth.verify(currentRequest())
    await writeAuditLog({ user: session?.user.id, document: input.document })
  },
})
```

For client-side cross-slice reactions, use a Zustand subscription inside the slice's setup, not action wrapping.

## Related

- [Store Architecture](./store-architecture.md) — slice contract, namespace rules
- [Middleware](./middleware.md) — boot-time composition
- [Persistence](./persistence.md) — `partialize` and per-slice persist
- [ADR-003](../003-zustand-state-management.md), [ADR-007](../007-full-stack-plugins-client-backend-segments.md)
