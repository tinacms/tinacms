# Persistence

> **Canonical sources:** [ADR-003](../003-zustand-state-management.md) (amended by ADR-007), [ADR-010](../010-form-state-model.md), [ADR-026](../026-draft-persistence-in-form-store.md).

The Zustand store wraps the standard `persist` middleware around its boot-time composition. The `partialize` selector picks the durable subset; everything else stays in memory.

## What's persisted by default

- **Session** (from the `auth` slice — token, user ID, refresh metadata) — survives reload so a returning editor isn't logged out.
- **UI preferences** (theme, sidebar open/closed, panel widths) — survives reload for the same editor on the same machine.
- **Last viewed** (collection / document selection) — optional, makes "reopen where I left off" work.
- **Form drafts** (dirty forms only, under the separate `tina-drafts` key): restored automatically on open, rebased onto the fetched document. See [ADR-026](../026-draft-persistence-in-form-store.md).

## What's *not* persisted

- **Pristine and clean form values**: forms load fresh from the Data Layer (`content` capability) each time a document opens; persisting them would race with content changes. Only dirty forms persist, as drafts. ([ADR-010](../010-form-state-model.md), [ADR-026](../026-draft-persistence-in-form-store.md))
- **Media list / search results / branch list** — fetched on demand from the Data Layer or relevant server segment.
- **Anything containing secrets.** Tokens go through the `auth` provider's secure storage path (httpOnly cookies where possible), not localStorage.

## How `partialize` is composed

Each client segment can declare its own persistable subset:

```ts
defineClientPlugin({
  slice: (set, get) => ({
    items: [],
    selected: null,
  }),

  // optional: subset of this slice to persist
  persist: (slice) => ({ selected: slice.selected }),
})
```

The runtime aggregates each plugin's `persist` selector with the core `partialize`, so the durable subset is the union of plugin contributions plus the core defaults.

## Storage backend

`localStorage` by default. Override at the config level:

```ts
import { defineConfig } from 'tinacms'
import { createJSONStorage } from 'zustand/middleware'

export default defineConfig({
  plugins: [ … ],
  store: {
    persist: {
      name: 'tina-store',
      storage: createJSONStorage(() => sessionStorage),   // or a custom backend
    },
  },
})
```

Common alternatives:

- **`sessionStorage`** — cleared on tab close. Useful when "stay logged in across reload but not across days" is the requirement.
- **`IndexedDB`** (via a small adapter) — for editors that legitimately need larger persisted state.
- **In-memory (no persist)** — set `storage: undefined` to disable.

## Migration

Standard Zustand `migrate` + `version`:

```ts
defineConfig({
  store: {
    persist: {
      name: 'tina-store',
      version: 2,
      migrate: (state, oldVersion) => {
        if (oldVersion < 2) {
          // shape change between v1 and v2
          return { ...state, sidebar: { open: state.sidebarOpen } }
        }
        return state
      },
    },
  },
})
```

## Related

- [Store Architecture](./store-architecture.md)
- [Extensibility](./extensibility.md) — how plugins contribute persist subsets
- [Middleware](./middleware.md)
- [ADR-003](../003-zustand-state-management.md), [ADR-010](../010-form-state-model.md)
