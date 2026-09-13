# The `select` field

The `select` field is one of the field plugins that v4 supplies. It shows a
fixed list of options, and a Zod enum checks the value.

## Files

The four files are in `plugins/fields/select/`:

| File | Role |
|---|---|
| `select-field.schema.ts` | The `t.select()` helper function, and the `selectSchema` validator |
| `select-field.client.tsx` | The descriptor, which takes the `select` key |
| `select-field.ui.tsx` | The `SelectField` component |
| `select-field.plugin.ts` | The manifest, `tina:field:select` |

## Authoring

`t.select({...})` adds `type: 'select'` (`SELECT_FIELD_TYPE`) to the config:

```ts
import { t } from '@tinacms/tinacms';

const collection = {
  name: 'post',
  fields: [
    t.select({
      name: 'status',
      label: 'Status',
      required: true,
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'published', label: 'Published' },
      ],
    }),
  ],
};
```

`SelectFieldSchema` extends `BaseFieldSchema`. It adds one property, `options`,
an array of `SelectFieldOption`:

| Key | Type | Effect |
|---|---|---|
| `value` | `string` (required) | the value the document stores |
| `label` | `string` | the text the trigger and the option list show; the field falls back to `value` when `label` is absent |

## The descriptor

The client segment (`select-field.client.tsx`) takes the `select` key:

```tsx
defineClientPlugin({
  field: {
    Component: SelectField,
    metadata: { layout: 'inline' },
    schema: selectSchema,
  },
});
```

The descriptor does not carry `type`. `select-field.plugin.ts` claims the
`select` key with `field: { type: SELECT_FIELD_TYPE, contractVersion: 1 }` on
the manifest (see
[`field-plugins.md`](./field-plugins.md#2-the-client-segment-and-the-descriptor-clienttsx)).

The descriptor has no `defaultValue`, no `parse`, and no `serialize`. An
absent field stays absent — the field does not pick a first option for the
author. The stored value and the editor value are the same plain string, so
no conversion runs between them.

## Validation

`selectSchema(node)` builds a `z.enum` from `options.map(o => o.value)`, and a
custom `errorMap` tells apart the two ways a value can fail:

| Config | Rule | Message |
|---|---|---|
| `required` | the value is `undefined` | `<label> is required` |
| — | the value is not one of `options` | `<label> must be one of the listed options` |

An optional field wraps the enum in `z.preprocess`, so `''` and `null` become
`undefined` and pass. This runs through the shared path (`validateField`); see
[`field-plugins.md`](./field-plugins.md#validation-in-two-layers).

## Ingest and digest

The field has no `parse` or `serialize` function, so `ingestDocument` and
`digestDocument` pass the stored value through unchanged. A document with no
stored value stays absent after ingest, because the descriptor sets no
`defaultValue`.

## The component

`SelectField` (`select-field.ui.tsx`) has no props. It reads its address and
its resolved schema node from the context, and it gets the value and the
errors from hooks that use the address.

The trigger shows an option's `label`, not its raw `value`. `@base-ui/react`'s
`Select.Value` only renders a `label` when `Select.Root` gets an `items` prop
that pairs each `value` with a `label`, so the component builds that list from
`field.options`:

```tsx
export function SelectField() {
  const address = useFieldAddress();
  const field = useFieldSchema<SelectFieldSchema>();
  const [value, setValue] = useFieldValue<string>(address);
  const errors = useFieldErrors(address);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useFieldActivation(() => triggerRef.current?.focus());

  const items = field.options.map((option) => ({
    value: option.value,
    label: option.label ?? option.value,
  }));

  return (
    <FieldWrapper errors={errors}>
      <Select items={items} value={value ?? null}
        onValueChange={(newValue) => setValue(newValue ?? undefined)}>
        <SelectTrigger ref={triggerRef} id={address}>
          <SelectValue placeholder='Select...' />
        </SelectTrigger>
        <SelectContent>
          {field.options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label ?? option.value}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldWrapper>
  );
}
```

`Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, and `SelectItem`
come from `@tinacms/ui/components/select`, the shadcn primitive that wraps
`@base-ui/react/select`.

## The connections

- The manifest is `select-field.plugin.ts`. Its name is `tina:field:select`,
  and it exports `selectFieldPlugin`.
- The registration is in `plugins/fields/index.ts`. That file adds the plugin
  to `corePlugins`, and it supplies `t.select`.

## Tests

`select-field.test.tsx` does these tests:

- It renders a stored option's label, falls back to the raw value when an
  option has no label, and shows the placeholder when the field is absent.
- It clicks the trigger, clicks an option, then reads the new value from the
  store.
- It rejects a missing value on a required field, and passes an empty value
  on an optional field.
- It rejects a value that is not in `options`.
- It passes a stored value through ingest and digest without a change, and
  leaves an absent field absent.
- It examines the metadata of the descriptor.
