# Store Architecture

> **Canonical sources:** [ADR-003](../003-zustand-state-management.md) (amended by ADR-007, refined by ADR-010), [ADR-007](../007-full-stack-plugins-client-backend-segments.md), [ADR-010](../010-form-state-model.md); [CONTEXT.md](../CONTEXT.md) for **Form**, **Field address**.

The Zustand store is **client-only** and composed **once at boot** from the static plugin list. Each plugin's client segment contributes a namespaced slice mounted under its capability key. **Form** state is core, per-document, and lives outside the slice composition (see [State Management](../architecture/state-management.md) for why).

## What the store contains

```
useTinaStore (client-only)
├── core slices (provided by tinacms)
│   ├── ui          theme, sidebar, edit mode, panel state
│   ├── branch      current branch, branches, dirty state
│   └── documents   selected collection, selected document
├── plugin slices (namespaced by capability key)
│   ├── auth        ← from whichever plugin provides 'auth'
│   ├── media       ← from whichever plugin provides 'media'
│   ├── search      ← from whichever plugin provides 'search'
│   └── <plugin-name> for plugins that provide non-capability state (e.g. 'editorial-workflow')
```

**Forms are not in here.** They live in a separate flat address-keyed store (per `formId`), because fields are dynamic and per-instance and the hot path is keystrokes. ([ADR-010](../010-form-state-model.md))

## Composition at boot

The middleware stack is fixed at `create()` time. Plugin slices are dropped into the composer from the static `defineConfig({ plugins: [...] })` list:

```ts
// pseudocode of the runtime composer
const useTinaStore = create<TinaStore>()(
  devtools(
    persist(
      (set, get, api) => ({
        // core slices
        ui:        createUiSlice(set, get, api),
        branch:    createBranchSlice(set, get, api),
        documents: createDocumentsSlice(set, get, api),

        // plugin slices — namespaced by capability key
        // (for singletons; keyed capabilities like `field` don't contribute slices)
        ...composePluginSlices(plugins, set, get, api),
      }),
      { name: 'tina-store', partialize: pickPersistableFields }
    ),
    { name: 'TinaStore' }
  )
)
```

`composePluginSlices` walks the resolved plugin list (after capability dependency sort) and mounts each client segment's slice at its capability key.

## Slice contract

Each client segment may expose:

```ts
defineClientPlugin({
  slice: (set, get) => ({
    // state
    items: [],
    selected: null,
    // actions
    async load(path: string) { … },
    select(item) { set({ selected: item }) },
  }),
  components: { MediaPicker, MediaBrowser },
  // optional: which subset of `slice` to persist
  persist: (slice) => ({ selected: slice.selected }),
})
```

The slice is composed once at boot. There is no per-instance slice for field plugins — field state lives in Form. ([ADR-010 §1](../010-form-state-model.md))

## Reading and writing

Inside a React component:

```tsx
import { useTinaStore } from 'tinacms/react'

function MediaCount() {
  const count = useTinaStore((s) => s.media.items.length)
  return <span>{count}</span>
}
```

Inside another plugin's slice action:

```ts
slice: (set, get) => ({
  publish: async () => {
    const user = get().auth.user
    if (!user) throw new Error('unauthenticated')
    // …
  },
})
```

Outside React (rare — usually inside a slice action):

```ts
import { useTinaStore } from 'tinacms'
const state = useTinaStore.getState()
const unsubscribe = useTinaStore.subscribe((s) => s.branch.current, (b) => log(b))
```

## What's deliberately *not* here

| Removed | Why |
|---|---|
| Runtime `store.extend(...)` | Plugin list is static; slices are composed at boot. ([ADR-003 amendment](../003-zustand-state-management.md)) |
| Action-wrapping (`store.setState({ login: wrapped })`) | Composition is server-side via `use('cap')`, not client-side monkey-patching. |
| `formSyncVersion` re-render counters | Forms are flat-by-address with structural isolation — no global re-render signal needed. ([ADR-010](../010-form-state-model.md)) |
| `formId`/`forms` slice with nested `forms[id].values` | Form is core, per-document, flat by address — separate from the plugin slice composition. |
| Event bus (`bus.on('document.save', …)`) | Slices read each other directly; cross-segment signalling uses RPC. |
| A server-side store | The store is client-only; the server is pure operations. |

## Related

- [Extensibility](./extensibility.md) — how plugin slices contribute (and what they can't do)
- [Middleware](./middleware.md) — boot-time middleware composition
- [Persistence](./persistence.md) — `partialize` strategy
- [State Management](../architecture/state-management.md) — Form ↔ store separation
- [ADR-003](../003-zustand-state-management.md), [ADR-007](../007-full-stack-plugins-client-backend-segments.md), [ADR-010](../010-form-state-model.md)
