# The `string` field

The `string` field is one of the field plugins that v4 supplies. It is also the
example in [`field-plugins.md`](./field-plugins.md). It shows a single line of
text, and a Zod validator checks the value. The source code is in
`plugins/fields/string/`.

## Authoring

`t.string({...})` is the typed function that you call in a collection. It adds
`type: 'string'` (`STRING_FIELD_TYPE`) to the config:

```ts
import { t } from '@tinacms/tinacms';

const collection = {
  name: 'post',
  fields: [
    t.string({ name: 'title', label: 'Title', required: true, min: 3 }),
  ],
};
```

The config (`StringFieldSchema`, which extends `BaseFieldSchema`):

| Key | Type | Effect |
|---|---|---|
| `name` | `string` (necessary) | The field key in the document. It is also the alternative label. |
| `label` | `string` | The label on the screen. The validation messages use it. |
| `required` | `boolean` | An empty value does not pass validation. Refer to the rules below. |
| `min` | `number` | The minimum length |
| `max` | `number` | The maximum length |
| `pattern` | `string` | The `RegExp` source that the value must obey |

## The descriptor

The client segment (`string-field.client.tsx`) takes the `string` key:

```tsx
defineClientPlugin({
  field: {
    Component: StringField,
    defaultValue: '',         // seeds a new/absent field on ingest
    metadata: { layout: 'inline' },
    schema: stringSchema,     // node -> ZodType
  },
});
```

The descriptor does not carry `type`. `string-field.plugin.ts` claims the
`string` key with `field: { type: STRING_FIELD_TYPE, contractVersion: 1 }`
on the manifest (see
[`field-plugins.md`](./field-plugins.md#2-the-client-segment-and-the-descriptor-clienttsx)).

The descriptor has no `validate`, `parse`, or `serialize` function. TinaCMS
stores the value without a change, and `schema` holds all the rules.

## Validation

`stringSchema(node)` (`string-field.schema.ts`) converts the config into a Zod
schema. The messages use `label`. If the config has no `label`, the messages use
`name`.

| Config | Rule | Message |
|---|---|---|
| `min` | `.min(min)` | `<label> must be at least <min> characters` |
| `max` | `.max(max)` | `<label> must be at most <max> characters` |
| `pattern` | `.regex(...)` | `<label> is invalid` |
| `required` | `.min(1)`, but only if `min` is not more than zero | `<label> is required` |

These conditions are important:

- **`required` with `min`** — If `min` is more than zero, `required` adds no
  rule. The `min` message tells the user about the empty value. If a necessary
  field has no `min`, the schema adds `.min(1, "<label> is required")`.
- **Optional fields** — The schema changes `''` and `null` to `undefined`. These
  values pass validation as `.optional()`. Thus an empty optional string is
  correct.
- **An incorrect `pattern`** — If the `pattern` is not a correct `RegExp`, the
  schema ignores it. Then the value has no pattern constraint.
- **The scope of the schema** — `stringSchema` uses the node of this field only.

These rules run on the shared two-layer path. `validateField` calls
`descriptor.schema`, then it calls `descriptor.validate`. Refer to
[`field-plugins.md`](./field-plugins.md#validation-in-two-layers).

## The component

`StringField` (`string-field.ui.tsx`) has no props. It reads its address from
the context. It gets the value and the errors from hooks that use the address.
Thus a keystroke renders this field again, but does not render the other fields
again.

```tsx
export function StringField() {
  const address = useFieldAddress();
  const [value, setValue] = useFieldValue<string>(address);
  const errors = useFieldErrors(address);
  const inputRef = useRef<HTMLInputElement>(null);

  useFieldActivation(() => inputRef.current?.focus()); // focus when active

  return (
    <div>
      <input ref={inputRef} aria-label={address} value={value ?? ''}
        onChange={(e) => setValue(e.target.value)} />
      {errors.map((e) => <span key={e} role='alert'>{e}</span>)}
    </div>
  );
}
```

## The connections

- The manifest is `string-field.plugin.ts`. It calls `definePlugin({ name:
  'tina:field:string', provides: ['field'], field: { type: STRING_FIELD_TYPE,
  contractVersion: 1 }, client: () => import('./string-field.client') })`, and
  it exports `stringFieldPlugin`.
- The registration is in `plugins/fields/index.ts`. That file adds the plugin to
  `corePlugins`, and it supplies `t.string`.

## Tests

`string-field.test.tsx` does these tests:

- It renders the value from the document.
- It uses the default value when the document has no value.
- It writes a keystroke to the value.
- It shows the shared message for the minimum length.
- It converts a value with ingest, then converts it again with digest. This
  test includes a `null` value and an absent value.
- It examines the metadata of the descriptor in the registry.
