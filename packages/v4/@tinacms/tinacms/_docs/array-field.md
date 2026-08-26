# The `array` field

The `array` field is one of the field plugins that v4 supplies. It repeats a
fixed set of item fields, and the author adds, removes, and reorders the
items. It is a compound field — see
[field-plugins.md](./field-plugins.md#compound-fields) for the shared
mechanism it uses.

## Files

The four files are in `plugins/fields/array/`:

| File | Role |
|---|---|
| `array-field.schema.ts` | The `t.array()` helper function, and the `arraySchema` validator |
| `array-field.client.tsx` | The descriptor, which takes the `array` key |
| `array-field.ui.tsx` | The `ArrayField` component, and its item row |
| `array-field.plugin.ts` | The manifest, `tina:field:array` |

## Authoring

`t.array({...})` adds `type: 'array'` (`ARRAY_FIELD_TYPE`) to the config. Its
`fields` property is the item template — an ordinary array of `FieldSchema`
nodes, the same shape a collection uses for its own `fields`:

```ts
import { t } from '@tinacms/tinacms';

const collection = {
  name: 'post',
  fields: [
    t.array({
      name: 'authors',
      label: 'Authors',
      required: true,
      fields: [
        t.string({ name: 'name', label: 'Name', required: true }),
        t.string({ name: 'role', label: 'Role' }),
      ],
    }),
  ],
};
```

`ArrayFieldSchema` extends `BaseFieldSchema`. It adds three properties:

| Key | Type | Effect |
|---|---|---|
| `fields` | `FieldSchema[]` (required) | the item template; every item has this same shape |
| `min` | `number` | the fewest items allowed; `required` alone implies `min: 1` |
| `max` | `number` | the most items allowed |

The stored value is an array of plain objects, one per item, keyed by each
item field's own `name`.

## The descriptor

The client segment (`array-field.client.tsx`) takes the `array` key:

```tsx
defineClientPlugin({
  field: {
    Component: ArrayField,
    // No defaultValue — an absent field stays absent, same as number/datetime.
    metadata: { layout: 'block', labelable: false },
    schema: arraySchema,
    parse, serialize,       // recurse into item fields — see below
    validateChildren,       // recurse into item fields — see below
  },
});
```

`metadata.labelable: false` because the field has no single input for a row's
`htmlFor` to reach. The component carries its own accessible name with
`aria-labelledby` instead — see
[Accessibility](../../../CLAUDE.md#accessibility) in the v4 CLAUDE.md.

## Validation

`arraySchema(node)` checks cardinality with `z.array(...).min(...).max(...)`.
`required` implies `min: 1` unless `min` is set explicitly:

| Config | Rule | Message |
|---|---|---|
| `required` (no `min`) | fewer than 1 item | `<label> needs at least 1 item` |
| `min` | fewer than `min` items | `<label> needs at least <min> items` |
| `max` | more than `max` items | `<label> allows at most <max> items` |

That schema checks the array's own shape only — it does not look inside an
item. Each item field's own rules run through `validateChildren`, which calls
`validateField(subfield, descriptor, item[subfield.name])` for every item
field of every item, and returns the messages keyed by the item's nested
address (`items.0.title`). The resolver (`editor/resolver.ts`) merges these in
beside the array's own cardinality messages. Thus each item field reports its
own errors through `useFieldErrors` at its own address, the same way a
top-level field does. Refer to
[field-plugins.md](./field-plugins.md#compound-fields).

## Ingest and digest

`parse` and `serialize` recurse: for each stored item, `parse` calls
`ingestDocument(item, field.fields, registry, context)`
(`core/form/ingest.ts`); for each edited item, `serialize` calls
`digestDocument(item, field.fields, registry, context)`. Both read the
registry from `context.registry` (`FieldTransformContext`,
`core/field/contract.ts`), which the form provider and the save path set. Thus
an item field with its own `parse`/`serialize` — a nested `datetime` field, for
example — converts the same way it would at the top level.

The registry is necessary: `invariant` throws `array-field-no-registry` if
`context.registry` is absent when `parse` or `serialize` runs.

## The component

`ArrayField` (`array-field.ui.tsx`) uses react-hook-form's own
`useFieldArray({ control, name: address })` for add, remove, and reorder — the
already-installed tool for exactly this job, with stable item keys so React
does not misalign inputs across a reorder.

For each item, for each item field, it renders a row — a `<label>` pointing at
the item field's own nested address (unless that field's descriptor sets
`labelable: false` too), then `<FieldNode address node>`:

```tsx
function ItemFieldRow({ address, node }: { address: string; node: FieldSchema }) {
  const labelable =
    useFieldRegistry().get(node.type)?.metadata?.labelable !== false;
  return (
    <div>
      <Label id={`${address}-label`} htmlFor={labelable ? address : undefined}>
        {node.label ?? node.name}
      </Label>
      <FieldNode address={toFieldAddress(address)} node={node} />
    </div>
  );
}
```

`<FieldNode>` (`editor/field.tsx`) is the part of `<Field>` that resolves a
descriptor and supplies `FieldAddressContext`/`FieldSchemaContext` — it does
not look the node up by name, so it accepts a node that lives outside the
collection schema. This is also why an item field's own `useFieldActivation`
already works for visual editing: `<FieldNode>` marks its address active on
focus, exactly as `<Field>` does for a top-level field, and the address it
uses happens to be a nested one.

A new item's default shape comes from `ingestDocument({}, field.fields,
registry, context)` — the same seeding a fresh top-level form gets, reused
rather than re-implemented.

## The connections

- The manifest is `array-field.plugin.ts`. Its name is `tina:field:array`,
  and it exports `arrayFieldPlugin`.
- The registration is in `plugins/fields/index.ts`. That file adds the plugin
  to `corePlugins`, and it supplies `t.array`.

## Tests

`array-field.test.tsx` does these tests:

- It renders each item's fields, adds an item, removes an item, and reorders
  items.
- It writes an edit to an item field back through the store at its nested
  address.
- It rejects too few items on a required field, and too many items past `max`.
- It rejects an invalid item field value, with the message at the item's own
  nested address.
- It round-trips items through ingest and digest, including an item field
  with its own `parse`/`serialize`.
- It examines the metadata of the descriptor.
