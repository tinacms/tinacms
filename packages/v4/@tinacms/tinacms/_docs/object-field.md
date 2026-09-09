# The `object` field

The `object` field is one of the field plugins that v4 supplies. It groups a
fixed set of nested fields under one name. It is a compound field — see
[field-plugins.md](./field-plugins.md#compound-fields) for the shared
mechanism it uses.

The `object` field is the `array` field without the repetition. It holds one
group, not a list of groups, so it has no add, remove, or reorder.

## Files

The four files are in `plugins/fields/object/`:

| File | Role |
|---|---|
| `object-field.schema.ts` | The `t.object()` helper function, and the `objectSchema` validator |
| `object-field.client.tsx` | The descriptor, which takes the `object` key |
| `object-field.ui.tsx` | The `ObjectField` component, and its field row |
| `object-field.plugin.ts` | The manifest, `tina:field:object` |

## Authoring

`t.object({...})` adds `type: 'object'` (`OBJECT_FIELD_TYPE`) to the config. Its
`fields` property is an ordinary array of `FieldSchema` nodes, the same shape a
collection uses for its own `fields`:

```ts
import { t } from '@tinacms/tinacms';

const collection = {
  name: 'page',
  fields: [
    t.object({
      name: 'seo',
      label: 'SEO',
      fields: [
        t.string({ name: 'title', label: 'Title', required: true }),
        t.string({ name: 'description', label: 'Description' }),
      ],
    }),
  ],
};
```

`ObjectFieldSchema` extends `BaseFieldSchema`. It adds one property:

| Key | Type | Effect |
|---|---|---|
| `fields` | `FieldSchema[]` (required) | the nested fields, keyed by each field's own `name` |

The stored value is a plain object, keyed by each nested field's own `name`.

## The descriptor

The client segment (`object-field.client.tsx`) takes the `object` key:

```tsx
defineClientPlugin({
  field: {
    Component: ObjectField,
    // No defaultValue — an absent field stays absent, same as array.
    metadata: { layout: 'block', labelable: false },
    schema: objectSchema,
    parse, serialize,       // recurse into nested fields — see below
    validateChildren,       // recurse into nested fields, at any depth — see below
  },
});
```

`metadata.labelable: false` because the field has no single input for a row's
`htmlFor` to reach. The component carries its own accessible name with
`aria-labelledby` instead — see
[Accessibility](../../../CLAUDE.md#accessibility) in the v4 CLAUDE.md.

## Validation

`objectSchema(node)` checks the value's own shape only — it must be an object.
`required` adds a floor: the object must hold at least one key.

| Config | Rule | Message |
|---|---|---|
| `required` | an empty or absent object | `<label> is required` |

Each nested field's own rules run through `validateChildren(value, node,
address, registry)`, which calls `validateFieldTree(subfield, descriptor,
value[subfield.name], \`${address}.${subfield.name}\`, registry)`
(`core/validation.ts`) for every nested field, and merges what it returns. It
builds each nested address from its own `address` parameter, not `node.name` —
an object nested inside another object is not addressed by its bare name
(`social`), only by where it actually sits (`seo.social`).

`validateFieldTree` runs `validateField` for the nested field, then — because a
nested field can itself be an `object` or an `array` — calls that field's own
`validateChildren` too, passing its own nested address down. So an object
nested in an object, or an array of objects, validates at any depth without
either field's code knowing the other exists. Refer to
[field-plugins.md](./field-plugins.md#compound-fields).

A nested field's message also reaches the object's own address through
`useFieldErrors` (`editor/hooks.ts`), the same way it does for the `array`
field.

## Ingest and digest

`parse` and `serialize` recurse: `parse` calls `ingestDocument(stored,
field.fields, context)` (`core/form/ingest.ts`); `serialize` calls
`digestDocument(value, field.fields, context)`. Both read the registry from
`context.registry` (`FieldTransformContext`, `core/field/contract.ts`), which
the form provider and the save path set. Thus a nested field with its own
`parse`/`serialize` — a nested `number` field, for example — converts the same
way it would at the top level.

`parse` reads a `null` stored value as an empty object, the same way the
`array` field reads `null` as an empty list.

## The component

`ObjectField` (`object-field.ui.tsx`) renders every nested field, always. An
absent stored value does not hide the nested fields — each nested field
resolves its own absent value and shows an empty control.

For each nested field, it renders a row — a `<label>` pointing at the nested
field's own address (unless that field's descriptor sets `labelable: false`
too), then `<FieldNode address node>`:

```tsx
function ObjectFieldRow({ address, node }: { address: string; node: FieldSchema }) {
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
descriptor and supplies `FieldAddressContext`/`FieldSchemaContext`. It does not
look the node up by name, so it accepts a node that lives outside the
collection schema. A nested field's own `useFieldActivation` works for visual
editing for the same reason.

## The connections

- The manifest is `object-field.plugin.ts`. Its name is `tina:field:object`,
  and it exports `objectFieldPlugin`.
- The registration is in `plugins/fields/index.ts`. That file adds the plugin
  to `corePlugins`, and it supplies `t.object`.

## Tests

`object-field.test.tsx` does these tests:

- It renders each nested field with its own label and value.
- It writes an edit to a nested field back through the store at its nested
  address.
- It rejects an empty value on a required object field.
- It rejects an invalid nested field value, with the message at the nested
  field's own address.
- It recurses into an object nested inside an object, with the message at the
  doubly-nested address, via a direct `validateChildren` call.
- It rolls a nested field's error up onto the object's own address.
- It goes dirty on a nested edit, then back to clean once the edit is undone.
- It round-trips the object through ingest and digest, including a nested field
  with its own `parse`/`serialize`.
- It reads a `null` stored value as an empty object.
- It refuses stored content that is not an object.
- It examines the metadata of the descriptor.
