# State Management

> **Canonical sources:** [ADR-003](../003-zustand-state-management.md) (amended by ADR-007, refined by ADR-010), [ADR-007](../007-full-stack-plugins-client-backend-segments.md), [ADR-010](../010-form-state-model.md); [CONTEXT.md](../CONTEXT.md) for **Form**, **Field address**.

State in v4 lives in two distinct places:

| Where | Owns | Composed | Identity |
|---|---|---|---|
| **Zustand store** (client-only) | Plugin slices, UI state, branch state, current document selection | **Once at boot** from the static plugin list | Namespaced by capability key (`store.media`, `store.auth`) |
| **Form** (core, per-document) | Field values + structure index for one open document | Created/destroyed as documents open/close | Flat map keyed by **Field address** |

The two are coordinated but not the same thing. The store is *slice-shaped* because plugins are static and namespaced; the Form is *flat* because fields are dynamic, per-instance, and the hot path is keystrokes.

## The Zustand store

### Client-only, boot-time composition

The store is **client-only** — the browser is where session, UI, and editor state live. The server side has no Zustand. ([ADR-007 amendment to ADR-003](../007-full-stack-plugins-client-backend-segments.md))

It is composed **once at boot** from the static list of plugins in `defineConfig`. Each client segment contributes a namespaced slice, mounted under its capability key:

```ts
// pseudocode of the boot-time composition
const useTinaStore = create<TinaStore>()(
  devtools(
    persist(
      (set, get, api) => ({
        // core slices
        ...createUiSlice(set, get, api),
        ...createBranchSlice(set, get, api),
        ...createDocumentsSlice(set, get, api),
        // plugin slices, namespaced under capability key
        media: createMediaPluginSlice(set, get, api),
        auth:  createAuthPluginSlice(set, get, api),
        search: createSearchPluginSlice(set, get, api),
      }),
      { name: 'tina-store', partialize: pickPersistableFields }
    ),
    { name: 'TinaStore' }
  )
)
```

Because the plugin list is static, the entire middleware stack is fixed at `create()` time. There is no need for the runtime `store.extend()` / `store.addMiddleware()` machinery sketched in earlier drafts of ADR-003 — those are dropped.

### What's *not* available

- **No `context.store.extend(...)` at runtime.** A plugin's slice is composed at boot; it cannot mutate the store shape later.
- **No action-wrapping.** Plugins do not replace existing actions (`store.setState({ login: wrapped })`) to layer behaviour. Use server-side composition (`use('auth')` inside a server segment) or a slice that consumes another slice by reading.
- **No event bus.** Cross-plugin signalling is by *reading* another slice (`get().auth.user`) or by an RPC call — not by emitting.
- **No store on the server.** Server segments are pure operations; they hold no shared mutable state in Zustand.

### Reading another plugin's slice

```ts
// inside a client segment slice action
const me = get().auth.user
if (!me) throw new Error('unauthenticated')
```

Slices are mounted at well-known capability keys, so namespace reads are stable across implementations: swap `tinacloud` for a self-hosted `auth` provider and `get().auth.user` keeps working.

### Persistence

The standard Zustand `persist` middleware is wrapped around the boot-time composer. The `partialize` selector picks the durable subset (session, theme, sidebar) and skips the volatile parts (form values, media list). See [Persistence](../store/persistence.md).

### Middleware

DevTools, persist, and any logging/error middleware compose statically at `create()` time. See [Middleware](../store/middleware.md).

## Form — core, not a slice

Forms are **core editing infrastructure**, not a per-plugin slice. ([ADR-010](../010-form-state-model.md))

The reasons CONTEXT.md flags explicitly:

- Fields are **dynamic and per-instance**: a list field with 30 string children means 30 string-field *instances*, created and destroyed as the editor navigates and arrays grow. There is no single "string-field slice" to compose at boot.
- The non-negotiable property is **per-keystroke re-render isolation**: editing one field must re-render that field only, never the tree.

So forms live outside the plugin slice composition, in their own flat address-keyed store.

### Shape: flat value map + structure index

```ts
// conceptual — one form (one open document)
{
  formId: 'posts/hello.mdx',
  values: {
    'title': 'Hello',
    'body.embed-7.text': 'Sign up',
    'blocks.block-12.cta.label': 'Click me',
    // ...
  },
  structure: {
    '':            ['title', 'body', 'blocks'],
    'body':        ['embed-7' /* anchor in rich-text AST */],
    'blocks':      ['block-12', 'block-15', ...],
    'blocks.block-12': ['cta', 'heading'],
    'blocks.block-12.cta': ['label', 'href'],
  },
  baseline: { /* address → value, as loaded */ },
  active: 'blocks.block-12.cta.label',
  errors: { /* address → string */ },
  collapsed: { /* address → boolean */ },
}
```

- **Leaf selectors** subscribe to a single address → O(1), stable reference for free, no path-walk.
- **Composite selectors** subscribe to the child-key list at their address → re-render when a child is added/removed/reordered, *not* when a child's value changes.
- **Array segments use stable per-item keys** (`block-12`), not positional indices, so an address survives reorder. Positions exist only at the render layer.

### Flatten on load, reconstruct on save

The incoming document is flattened into the address map + structure index on load; on save, the runtime walks the structure index and reconstructs document shape (order from the index + schema). Dirty-tracking and partial/patch saves diff the address map against `baseline` and emit the exact set of changed addresses.

### Hooks are subscriptions, not events

Field components receive *only* their Field address via context. Everything else is pulled through address-keyed Zustand-selector hooks:

- `useFieldValue(address)` — leaf value, stable reference
- `useFieldErrors(address)`
- `useFieldActivation(handler)` — opt-in callback when this field becomes the active field (powers focus / popover / map-centering on click-to-edit)
- `useSiblingValue(address, sibling)` — conditional logic across fields in the same composite

Nothing "fires" a hook; selectors subscribe, components re-render when their selected slice changes.

### Multiple forms

`formId` scopes a Form to one open document. Multiple Forms can be live at once — that is how a **reference field** hosts a second document's form. Each is its own flat map.

### Guardrails

The value map and structure index must stay consistent. Therefore:

- All structural operations (add / remove / reorder / duplicate) go through a **single set of atomic form actions** — no plugin pokes the store directly.
- Deletes **cascade-sweep** the subtree (removing an array item purges every `prefix.*` value entry), or stale data leaks back into the document on save.

These are non-negotiable because the cost of going flat is value↔structure consistency.

## The visual-editing channel

Click-to-edit `postMessage`s a **Field address** across the preview iframe and sets it as the Form's active field. The active-field state has multiple producers (visual-editing click, validation jump, deep link) and one consumer (the Form). ([ADR-009](../009-field-plugins.md))

- **Reveal** (expand collapsed ancestors + scroll into view) is **runtime-owned and universal** — works for any addressable node without the field cooperating.
- **Activate** (focus input, open popover, center map) is **field-owned and opt-in** via `useFieldActivation`.
- When the active address terminates at a **composite**, the default is *reveal-and-stop* — never auto-drill into a descendant.

## Related

- [Store Architecture](../store/store-architecture.md) — slice contract, what's core vs plugin
- [Extensibility](../store/extensibility.md) — how plugins contribute slices (and what they can't do)
- [Middleware](../store/middleware.md) — boot-time middleware composition
- [Persistence](../store/persistence.md) — `partialize` strategy
- [ADR-010](../010-form-state-model.md) — the Form decision in full
