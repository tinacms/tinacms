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
    validateChildren,       // recurse into item fields, at any depth — see below
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
item. Each item field's own rules run through `validateChildren(value, node,
address, registry)`, which calls `validateFieldTree(subfield, descriptor,
item[subfield.name], \`${address}.${index}.${subfield.name}\`, registry)`
(`core/validation.ts`) for every item field of every item, and merges what it
returns. It builds each item's address from its own `address` parameter, not
`node.name` — an array nested inside another array is not addressed by its
bare name (`members`), only by where it actually sits
(`groups.0.members`).

`validateFieldTree` is what makes an array of arrays validate correctly: it
runs `validateField` for the item field, then — because an item field can
itself be an `array` — calls that item field's own `validateChildren` too,
passing its own nested address down. So the recursion is not array-specific
code reaching into another array; it is every compound field calling the same
function, each with its own current address. A future compound field (a
`reference` embedding some of the referenced document's fields, say) gets this
for free the same way, and composes with `array` — a reference inside an
array, or an array inside a reference — without either field's code knowing
the other exists. The resolver (`editor/resolver.ts`) starts this same call
for each top-level field, then merges everything it returns in beside the
array's own cardinality messages. Thus each item field, at any depth, reports
its own errors through `useFieldErrors` at its own address, the same way a
top-level field does.

An item's message also reaches the array's own address, and every array
above it — an item collapsed inside a closed nested array still needs to be
visible from outside. This is not something `validateChildren` writes into
the tree: react-hook-form represents `authors` (a name `useFieldArray`
registers) as a real array of its items' errors, and drops any `type`/
`message` of the array's own sitting alongside that array — so the array's
own address is never itself an entry once an item errors. `useFieldErrors`
(`editor/hooks.ts`) gets there anyway, by reading rather than writing:
`collectFieldErrorMessages` (`editor/field-errors.ts`) walks every node under
an address in whatever tree react-hook-form actually kept, and collects
every message underneath. So `useFieldErrors('authors')` sees an item's
message the same way `useFieldErrors('authors.0.name')` does — and for
`groups`/`members` nesting, `useFieldErrors('groups')` sees a message from
`groups.0.members.0.name` too. Refer to
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
- It rejects an invalid value inside an array nested inside an array, with
  the message at the doubly-nested address, via a direct `validateChildren`
  call.
- It rolls an item field's error up onto the array's own address, and up
  through every ancestor array for a doubly-nested item.
- It goes dirty on a reorder, then back to clean once edits restore the
  original values.
- It round-trips items through ingest and digest, including an item field
  with its own `parse`/`serialize`.
- It examines the metadata of the descriptor.
