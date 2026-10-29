# Migration Guide

> **Important:** v4 is a **rewrite**, not an incremental upgrade. There is no automatic codemod that turns v2 code into v4 code. This guide is a translation of v2 concepts to their v4 counterparts so projects can plan the move; details will firm up as implementation lands.

## Mental-model changes

| v2 | v4 |
|---|---|
| Many packages (`tinacms`, `@tinacms/core`, `@tinacms/cli`, …) | One `tinacms` package with subpath entries ([ADR-001](../001-single-package-architecture.md)) |
| Plugins are a secondary concept; core has implicit field/media/auth/search built in | **Everything is a plugin** — including built-ins. Core is a plugin runtime. ([ADR-002](../002-plugin-first-architecture.md)) |
| Plugin "type": `field` / `media` / `search` / `auth` | No `type` field — a plugin's kind is what it `provides` ([ADR-006](../006-plugin-dependency-resolution.md)) |
| `dependencies: ['plugin-name']` | `dependsOn: ['capability']` |
| Implicit single-provider semantics, last-wins | **Capability conflict** is a hard error; `overrides` is the only sanctioned replace ([ADR-006](../006-plugin-dependency-resolution.md)) |
| Client-only plugins, backend configured separately | **Full-stack plugins** with lazy `client`/`server` segments, one npm install ([ADR-007](../007-full-stack-plugins-client-backend-segments.md)) |
| GraphQL server is a separate system | GraphQL is the wire-format implementation of the `content` capability inside the Data Layer ([CONTEXT.md](../CONTEXT.md)) |
| Forms slice with nested `forms[id].values` | **Form is core, flat-by-address** ([ADR-010](../010-form-state-model.md)) |
| Container fields (array/list) own a render-children switch on `child.type` | **Composition by delegation** via Component resolution — no type-branching ([ADR-009](../009-field-plugins.md)) |
| Visual editing tracked separately from the form's active field | **Field address** is the single identity rail; visual editing sets the form's active address ([ADR-009](../009-field-plugins.md)) |
| Auth checks scattered per-handler | **Secure-by-default** RPC; `publicOp()` is the only opt-out; **permission-based RBAC** ([ADR-008](../008-authorization-permissions-roles.md)) |

## Installation

```diff
- npm install tinacms @tinacms/core @tinacms/cli @tinacms/app
+ npm install tinacms
```

## Imports

```diff
- import { defineConfig } from '@tinacms/core'
+ import { defineConfig } from 'tinacms'

- import { TinaCMS } from 'tinacms'
+ import { TinaProvider } from 'tinacms/react'

- import { defineDevCommand } from '@tinacms/cli'
+ // No equivalent — `tina dev` is now a CLI command inside the single package
```

## Plugin registration

```diff
- defineConfig({
-   plugins: [
-     defineFieldPlugin({ name: 'rating', Component, dependencies: ['core-plugin'] }),
-     defineMediaPlugin({ name: 's3', upload, list, delete }),
-     defineAuthPlugin({ name: 'auth0', login, logout, checkPermissions }),
-     defineFeaturePlugin({ name: 'workflow', hooks: { beforeSave, afterSave } }),
-   ],
-   modules: [coreModule(), fieldModule(), mediaModule({ provider: 'local' })],
- })

+ defineConfig({
+   plugins: [
+     // No `modules` array — everything is a plugin
+     tinaCloud(),                                      // provides: ['content','auth','media']
+     ratingField(),                                    // provides: ['field'], delegating string
+     editorialWorkflow(),                              // provides: [], dependsOn: ['content','auth']
+   ],
+ })
```

The unified `definePlugin` shape:

```diff
- defineFieldPlugin({
-   name: 'rating',
-   Component: RatingComponent,
-   defaultValue: 0,
-   dependencies: ['some-plugin'],
- })

+ definePlugin({
+   name: 'rating-field',
+   provides: ['field'],
+   dependsOn: [],                       // capabilities, not plugin names
+   client: () => import('./client'),    // exports defineClientPlugin({ field: { type: 'rating', Component, ... } })
+ })
```

## Field component contract

```diff
- Component: ({ value, onChange, field, error, disabled }) => (
-   <input value={value} onChange={(e) => onChange(e.target.value)} />
- )

+ function MyField() {
+   const address = useFieldAddress()
+   const [value, setValue] = useFieldValue<string>(address)
+   const errors = useFieldErrors(address)
+   return <input value={value ?? ''} onChange={(e) => setValue(e.target.value)} />
+ }
```

Reason: forms are flat-by-address in v4. Reading by hook gives O(1) leaf reads with stable references; passing value/onChange through React props forces composite-tree re-renders on every keystroke. ([ADR-010](../010-form-state-model.md))

## Composite (array/list/object) fields

```diff
- Component: ({ value = [], onChange, field }) => (
-   value.map((item, i) => {
-     const childPlugin = getFieldPlugin(field.itemField.type)
-     return <childPlugin.Component value={item} onChange={(v) => { … }} />
-   })
- )

+ function ListField() {
+   const address = useFieldAddress()
+   const childKeys = useChildKeys(address)
+   const { addItem, removeItem } = useFormActions()
+   return (
+     <>
+       {childKeys.map((key) => <Field key={key} address={`${address}.${key}`} />)}
+       <button onClick={() => addItem(address)}>Add</button>
+     </>
+   )
+ }
```

Reason: composition is by delegation; the composite never branches on a child's `type`. Adding a field type touches zero lines of composites. ([ADR-009 §2](../009-field-plugins.md))

## Media / search / auth providers

```diff
- defineMediaPlugin({ name: 's3', upload, list, delete })  // ran in the browser, somehow

+ // Server segment — runs on the user's Backend, holds the SDK + secrets
+ defineServerPlugin({
+   upload: async (input) => { /* S3 SDK call */ },
+   delete: protectedOp({ permission: 'media:delete' }, async (input) => { /* … */ }),
+ })
+ // Client segment calls it via typed RPC
+ await server.media.upload({ file, path })
```

The full-stack plugin model is the central change. ([ADR-007](../007-full-stack-plugins-client-backend-segments.md))

## Permission checks

```diff
- auth.checkPermissions(user, 'media:delete', resource)  // ad-hoc per-handler

+ // Plugin declares permission
+ definePlugin({ permissions: [{ name: 'media:delete', description: '…' }] })
+
+ // Server gates on it (the only enforcement)
+ delete: protectedOp({ permission: 'media:delete' }, handler)
+
+ // Client uses it for UX only
+ const canDelete = useHasPermission('media:delete')
```

([ADR-008](../008-authorization-permissions-roles.md))

## Editorial workflow

The workflow shape (branches → PR → merge) is unchanged. The **location** of git changed: the Admin UI no longer shells out git; branch/commit/publish are operations on the `content` capability, run inside the Data Layer. ([ADR-004 amendment](../004-git-editorial-workflow.md))

## Store extensions

```diff
- // v2-style plugin extending the store at runtime
- const plugin = {
-   init: (ctx) => {
-     ctx.store.extend((set) => ({ myData: null, myAction: () => { … } }))
-   },
- }

+ // v4 — declared as the client segment's slice, composed at boot
+ defineClientPlugin({
+   slice: (set, get) => ({
+     myData: null,
+     myAction: () => { … },
+   }),
+ })
```

([ADR-003 amendment](../003-zustand-state-management.md))

## Schema

The schema helpers (`defineCollection`, `t.string`, `t.object`, `t.list`, `t.reference`) are conceptually preserved from v2. The exact API will be pinned down in the Configuration ADR (not yet written — see [Milestones M3](./milestones.md)).

### Field options

v4 has no `ui` wrapper. Field options sit at the top level of the field ([ADR-029](../029-field-ui-options.md)). A schema that still sets a dropped option fails `tinacms build` with the replacement in the message.

Kept, now top level:
- `ui.description` is `description`.
- `ui.defaultValue` is `defaultValue`. It is a stored-form value. It fills the field in a new array item only, and never changes a loaded document.
- `ui.hidden` is `hidden`. The value is kept and Save is never blocked by it.
- `defaultItem` stays on arrays and templates. A templates array takes it per template only.

Dropped, with a replacement:
- `ui.component`: the field type picks the plugin. Register a field plugin for another widget.
- `ui.parse` and `ui.format`: declare `parse` and `serialize` on the field plugin. For a one-off transform, use a collection hook.
- `ui.validate`: use named `validators`.
- `min` and `max`: use the `min()` and `max()` validators.

Renamed:
- `ui.itemProps` is `itemLabel: (item) => string`. v4 has no item `key`.
- `visualSelector` is `picker: 'list' | 'grid'`.
- `previewSrc` is `previewImage`, a path relative to the media root.

Already in v4: rich-text `overrides`.

Pending (not built, no replacement yet):
- Color `colorFormat`, `widget`, `width`, `colors`: v4 has no color field plugin.
- `toolbarOverride`: v3 deprecates it for `overrides.toolbar`, which v4 rich-text supports. Needs a maintainer ruling.
- Reference `collectionFilter`: the v4 content contract lists `{ path }` only. Needs a contract change.
- `dateFormat` and `timeFormat`: the v4 datetime field uses the native `datetime-local` input, which has no token grammar. Needs a widget and grammar decision.
- `category` and `optionComponent`: undecided open questions in ADR-029.

## What this guide *can't* cover yet

- The Configuration ADR (open) defines `defineConfig` shape under capabilities. Field-schema migration details depend on it.
- The `content` capability contract ADR (open) defines what a Data Layer is responsible for; self-hosted migrators will read it to know whether a v2 self-hosted setup can be adapted or needs to be reimplemented.
- The RPC payload codec (open) affects how custom plugins handle binary upload.

## Related

- [ADR-001](../001-single-package-architecture.md), [ADR-002](../002-plugin-first-architecture.md), [ADR-006](../006-plugin-dependency-resolution.md), [ADR-007](../007-full-stack-plugins-client-backend-segments.md), [ADR-008](../008-authorization-permissions-roles.md), [ADR-009](../009-field-plugins.md), [ADR-010](../010-form-state-model.md)
- [Custom Plugins](../plugins/custom-plugins.md) — the worked v4 plugin example
- [Public API](../api/public-api.md) — entry points and types
