# ADR-024: `defineConfig` Shape — The Composition Root

## Status
**Accepted** — the capstone that ties together every capability/plugin ADR. Builds on [ADR-002](./002-plugin-first-architecture.md) (everything-is-a-plugin), [ADR-006](./006-plugin-dependency-resolution.md) (capabilities / `overrides`), [ADR-007](./007-full-stack-plugins-client-backend-segments.md) (`definePlugin` + config), [ADR-008](./008-authorization-permissions-roles.md) (operational data), [ADR-016](./016-schema-compiled-artifact.md)/[ADR-017](./017-content-model.md) (schema / content model), and the capability contracts ([ADR-019](./019-content-capability-contract.md)/[ADR-021](./021-search-capability-contract.md)/[ADR-022](./022-media-capability-contract.md)/ADR-023 (not yet public)).

## Context
`defineConfig` has been referenced since ADR-002 but never specified. Now that `content`, `search`, `media`, `auth`, and the schema/content model are all defined, the composition root can be pinned: its top-level shape, where per-capability config lives, and what's deliberately excluded.

## Decision

### 1. Two sibling concerns: `{ plugins, schema }`
```ts
defineConfig({
  plugins: [ /* capability providers + field plugins + feature plugins */ ],
  schema:  { collections: [ /* the content model */ ] },
})
```
- **`plugins`** = everything-is-a-plugin for *behavior* (ADR-002): capability providers, **Field plugins**, feature plugins.
- **`schema`** = the **content model** (Collections, ADR-016/017) — a **sibling, not a plugin**, because it's the *user's content model*, not an extension. The schema's field `type`s resolve against installed **Field plugins**.

### 2. Per-capability config lives on the provider plugin
`tinaCloud({...})` (the cloud bundle — provides `content`+`media`+`search`+`auth`+`draft`), `s3Media({ bucket })`, `auth0({...})` — config is **co-located with the provider** in the `plugins` list, never as separate top-level keys (ADR-007).

### 3. Built-ins by default; Data Layer explicit
Built-in field plugins are **included by default** (ADR-002); `plugins` is for **additions + `overrides`** (ADR-006). A **`content` / Data Layer provider must be specified** (which one you're on).

### 4. Build-time config, not runtime data — explicit exclusions
`defineConfig` **deliberately does not hold**:
- **Roles & assignments** → auth provider runtime data (ADR-008).
- **The auth origin allowlist** → operational, dashboard (ADR-023).
- **Branch / publish** → Data Layer operational concern (ADR-004/018).

Config is **code/shape**; operational/runtime data lives in the dashboard / provider / deployment. (This records the session-long theme one final time.)

## Consequences

### Positive
- **Clean separation**: behavior = `plugins`, content = `schema`.
- Per-capability config is **discoverable on its provider**; bundles (`tinaCloud`) keep the common case to one line.
- The lean surface + explicit exclusions encode "operational data isn't config" at the top level.
- Everything composes through **one typed entry point**.

### Negative
- The user must know which provider supplies which capability — mitigated by bundles like `tinaCloud(...)`.

## Alternatives Considered
- **Everything-is-a-plugin, schema included** — *rejected*: the content model isn't an extension; forcing it through the plugin model adds ceremony for no gain.
- **Top-level per-capability config keys** — *rejected*: config belongs *on* its provider plugin.
- **Operational data (roles / auth-origin / branch) in config** — *rejected*: runtime/operational, lives elsewhere (the recurring line across ADR-008/023/004/018).

## References
- [CONTEXT.md](./CONTEXT.md) — `defineConfig`, Plugin, Capability, Schema, Collection, Field plugin, Data Layer, Role
- [ADR-002](./002-plugin-first-architecture.md), [ADR-006](./006-plugin-dependency-resolution.md), [ADR-007](./007-full-stack-plugins-client-backend-segments.md), [ADR-008](./008-authorization-permissions-roles.md), [ADR-016](./016-schema-compiled-artifact.md), [ADR-017](./017-content-model.md)
