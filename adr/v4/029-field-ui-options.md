# ADR-029: Field Options Live at the Top Level, Not Under `ui`

## Status
**Proposed** (2026-10-29). Decisions 1 to 7 were approved by the team. Collection options (`router`, `filename`, `allowedActions`, `global`, `beforeSubmit`) are out of scope and need their own ADR. Resolves the field-level half of Field Type Implementation: Decide which v3 ui options stay and where they live ([#7850](https://github.com/tinacms/tinacms/issues/7850)). Builds on [ADR-009](./009-field-plugins.md) and [ADR-017](./017-content-model.md).

## Context
v3 configured fields through a `ui` object: `ui.component`, `ui.hidden`, `ui.defaultValue`, `ui.itemProps` and more. v4 has no decision on them. No ADR covers `ui`, and the v4 docs use only `ui.component` and `ui.hidden`, in passing.

v4 already puts `label` and the validators at the top level of a field. That leaves `ui` as a second place to look for field settings.

v4 also has field plugins (ADR-009). A plugin owns how its field renders, parses and validates. Several v3 options do a job that a plugin or a validator now does.

This ADR decides, for each field-level v3 `ui` option, whether it stays and where it lives.

## Decision

### 1. No `ui` wrapper
Every field option that stays sits at the top level of the field, template or array. v3 users get a migration note for each option that moves.

### 2. Basic options: `description`, `defaultValue`, `hidden`
All three stay, at the top level of the field.

- `description` is help text under the field label. v4 has no field `description` today.
- `defaultValue` is the starting value for the field in a new document. The plugin's own default (`defaultValue` on the plugin declaration) still applies when the field sets none.
- `hidden` keeps the value and renders no editor. The docs define a hidden field with `ui: { hidden: true }` (`adr/v4/CONTEXT.md:88`).

```ts
t.string({
  name: 'slug',
  label: 'Slug',
  description: 'Used in the page URL',
  defaultValue: '',
  hidden: true,
})
```

### 3. Dropped options: `component`, `parse`, `format`, `validate`, `min`, `max`
These options leave the field. Each has a v4 replacement.

- `component`: the field type picks the plugin that renders it. To render a value with another widget, register a field plugin for it (for example, a color plugin). The schema no longer names a widget.
- `parse` and `format`: the field plugin declares them (`adr/v4/api/internal-apis.md:90`).
- `validate`: named validators replace it (`adr/v4/plugins/field-plugins.md:177`).
- `min` and `max`: the first-party `min()` and `max()` validators replace them (`packages/v4/@tinacms/tinacms/src/plugins/validators/core-validators.schema.ts:51`).

A one-off transform on a single field has no field-level option. Use a custom field plugin, or a collection hook (ADR-025). ADR-025 rejected field-level hooks.

### 4. Type-specific options stay at the top level of their type
An option that only applies to one field type sits on that type's builder, and the type checker rejects it elsewhere.

- datetime: `dateFormat`, `timeFormat`
- color: `colorFormat`, `widget`, `width`, `colors`
- reference: `collectionFilter`
- rich-text: `toolbarOverride`, `overrides`

### 5. `defaultItem` stays on arrays and templates
`defaultItem` sets the starting value of a new array item. It works on every kind of array (scalar, object and templates) and on each template. It sits at the top level of the array or template.

v3 deprecates the field-level `defaultItem` on a templates array in favour of one per template (`packages/@tinacms/schema-tools/src/types/index.ts:1204`). v4 drops that field-level version.

### 6. `itemProps` becomes `itemLabel`
`itemProps` returned `{ key?, label? }`. v4 gives every array item a stable key (ADR-009), so `key` has no job. Only `label` is left.

`itemLabel: (item) => string` replaces `itemProps`. It sits at the top level of an object array or a template. Scalar arrays have no `label` in v3 (the item is its own value), so they get no `itemLabel`.

### 7. `visualSelector` becomes `picker`
`visualSelector` is a boolean on an array of templates. It switches between the small dropdown and a visual picker with images (`packages/tinacms/src/toolkit/fields/plugins/blocks-field-plugin/index.tsx:123`).

`picker` replaces it. `picker` takes a string of options, for example `'list'` or `'grid'`. It defaults to `'grid'` when any template has a `previewImage`, and to `'list'` otherwise. A string takes new picker styles later, where a boolean cannot.

`previewImage` is the new name for the v3 template option `previewSrc` (`packages/@tinacms/schema-tools/src/types/index.ts:743`). It sits at the top level of a template.

```ts
t.array({
  name: 'blocks',
  label: 'Blocks',
  picker: 'grid',
  templates: [
    {
      name: 'hero',
      defaultItem: { headline: 'New hero' },
      itemLabel: (item) => item.headline,
      fields: [t.string({ name: 'headline' })],
    },
  ],
})
```

## Consequences

### Positive
- There is one place to look for a field setting.
- Options that only apply to one type are type-checked on that type.
- A widget is a plugin, so the schema holds no UI code and ships no component reference.
- Fewer options overlap with plugins, validators and hooks, so each job has one owner.

### Negative
- Every dropped or moved option needs a migration note for v3 users.
- Rendering a value with a different widget needs a new field plugin, where v3 needed one string.
- `description`, `hidden`, `defaultValue`, `itemLabel`, `picker` and `previewImage` are new to v4 and need code, tests and a barebones example.
- `previewSrc` becomes `previewImage`, so v3 users also need a rename note for it.
- These docs use `ui` or the dropped options and must change: `adr/v4/api/public-api.md` (lines 53, 105, 117), `adr/v4/systems/graphql-server.md:72`, `adr/v4/systems/code-generation.md:29`, `adr/v4/plugins/field-plugins.md:390` and `adr/v4/CONTEXT.md:88`. The `min` and `max` props in `public-api.md:105` are already stale.

## Open questions
- **`category`.** It groups templates in the visual picker. Decision 7 does not mention it, and v3 reads it only in that picker (`block-selector-big.tsx:72`).
- **`optionComponent`** (reference field). It is a component, like `component`. This ADR does not decide it.
- **Array naming.** These decisions say "array", as the v4 code does (`array-field.schema.ts:28`). The ADRs call the type `list` (`adr/v4/CONTEXT.md:120`).

## Alternatives Considered

### 1. Where options live
- **Keep `ui` for how a field looks** (`hidden`, `component` and the display options). This keeps the v3 shape. Rejected: authors must decide which side of the line each option falls on, and `label` already breaks the line.

### 2. `defaultValue`
- **Drop it and let each plugin set the default.** The smallest surface. Rejected: authors lose a per-field default.

### 3. Dropped options
- **`component` as a string or an inline React component.** Convenient. Rejected: it puts UI code in the schema, which the plugin model avoids.
- **Keep `parse` and `format` as per-field overrides.** More flexible. Rejected: a value would then have two places where it is transformed.

### 4. Type-specific options
- **Move them to plugin configuration.** The schema gets smaller. Rejected: the setting sits far from the field it changes.

### 5. `defaultItem`
- **Keep both placements as in v3.** No breakage. Rejected: a templates array would have two places to set the same value.

### 6. `itemLabel`
- **Keep `itemProps` with `key` and `label`.** No change for v3 users. Rejected: `key` stays as dead weight.

### 7. `picker`
- **Keep `visualSelector` as a boolean.** No change for v3 users. Rejected: each new picker style would need another option.

## References
- [#7850](https://github.com/tinacms/tinacms/issues/7850): Field Type Implementation - Decide which v3 ui options stay and where they live
- [ADR-009](./009-field-plugins.md), [ADR-017](./017-content-model.md), [ADR-025](./025-form-hook-registration.md)
