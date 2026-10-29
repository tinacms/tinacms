# The `select` field

The `select` field is one of the field plugins that v4 supplies. It shows a
fixed list of options, and a Zod enum checks the value.

## Files

The files are in `plugins/fields/select/`:

| File | Role |
|---|---|
| `select-field.schema.ts` | The `t.select()` helper function, and the `selectSchema` validator |
| `select-field.client.tsx` | The descriptor, which takes the `select` key |
| `select-field.ui.tsx` | The `SelectField` editor component: reads the address, value and frame from the editor hooks |
| `select-field.view.tsx` | `SelectFieldView`: the trigger and option list, from props only |
| `select-field.states.ts` | The state catalogue: every look, with a lookup by name |
| `select-field.states.test.tsx` | One render test over every state, plus the inert, keyboard, None and disabled-option tests |
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
      validators: [required()],
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

> `required`, `min`, `max` and `pattern` are no longer config keys. They are
> validators that a core plugin registers, and a collection attaches them with
> `validators`. Refer to
> [Validation in two layers](./field-plugins.md#validation-in-two-layers).


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
| — | the value is not one of `options` | `<label> must be one of the listed options` |

An optional field wraps the enum in `z.preprocess`, so `''` and `null` become
`undefined` and pass. This runs through the shared path (`validateField`); see
[`field-plugins.md`](./field-plugins.md#validation-in-two-layers).

## Ingest and digest

The field has no `parse` or `serialize` function, so `ingestDocument` and
`digestDocument` pass the stored value through unchanged. A document with no
stored value is `null` after ingest, because the descriptor sets no
`defaultValue`, and digests as absent.

## The component

`SelectField` (`select-field.ui.tsx`) has no props. It reads its address, its
resolved schema node and the frame from hooks, and passes them to
`SelectFieldView`. `useFieldActivation` focuses the trigger.

`SelectFieldView` (`select-field.view.tsx`) holds no editor state. It takes the
frame props (`label`, `required`, `errors`, `help`, `warnings`), `items`,
`value`, `onChange`, and the optional `placeholder` (default `Select...`),
`disabled` and `readOnly`. It draws the Form Controls Select inside the Field
wrapper.

The trigger shows an option's `label`, not its raw `value`. `@base-ui/react`'s
`Select.Value` only renders a `label` when `Select.Root` gets an `items` prop
that pairs each `value` with a `label`, so the view passes its list there. A
stored value that is not in `items` shows as its raw value, next to the
"must be one of the listed options" error.

### The "None" row

An optional field has a "None" row. It is the only way to clear a stored value,
and it sets the value to `null`. A required field has no "None" row. The view
adds the row from the `required` flag. An option with an empty-string value
collides with the "None" row, which uses `''`. The schema does not forbid it.

### Looks

- **Disabled:** the Field wrapper fades the whole field once. The trigger does
  not fade again. The list never opens, and there is no hover.
- **Read-only:** the view sets the Base UI `readOnly` prop, which keeps the list shut.
  The trigger has a muted fill, a subtle border and no chevron. The list never
  opens, and there is no hover.
- **Disabled option:** `SelectFieldViewItem` has optional `disabled` and `hint`.
  A disabled option is grey, with no strikethrough and no hover, and cannot be
  picked. The `hint` shows as the option `title`. `SelectFieldOption` in the
  public schema does not have these keys, so only the catalogue sets them.
- **Width:** the trigger fills the field width and truncates a long label. The
  width is set in the view, so the shared trigger keeps `w-fit` for other
  consumers.
- **Focus:** the trigger shows its ring on `focus-visible` only.

`disabled`, `readOnly`, `help` and `warnings` have no source in the real editor
today. Only the catalogue and tests reach them.

The shared trigger and option classes live in `@tinacms/ui`
(`components/select.tsx` and `lib/field-styles.ts`). Combobox, the media
filters and the Reference field use them.

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
  holds an absent field as `null` and digests it as absent.
- It examines the metadata of the descriptor.
- `select-field.states.test.tsx` renders every state in the catalogue and checks
  the accessible name, the messages, `aria-invalid`, help, the disabled and
  read-only attributes, and the absence of an "unsaved" marker. It also checks
  that inert states never open or change, that the keyboard opens and picks,
  that Escape closes without a change, the "None" row, and that a disabled
  option cannot be picked.
- `select-field.test.tsx` also checks that an invalid pick, by mouse and by
  keyboard, shows its error with no extra blur.
