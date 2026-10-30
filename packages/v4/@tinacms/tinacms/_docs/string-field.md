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
    t.string({ name: 'title', label: 'Title', validators: [required(), min(3)] }),
  ],
};
```

The config (`StringFieldSchema`, which extends `BaseFieldSchema`):

| Key | Type | Effect |
|---|---|---|
| `name` | `string` (necessary) | The field key in the document. It is also the alternative label. |
| `label` | `string` | The label on the screen. The validation messages use it. |
| `multiline` | `boolean` | A 96px box for plain paragraphs. It scrolls inside and drags taller. Without it, one line that ends in an ellipsis. |
| `mono` | `boolean` | Shows the value in the code font, in either box. |
| `placeholder` | `string` | Grey hint text in an empty box. |

Turning `multiline` off for a field with stored paragraphs shows the lines
joined. The stored value changes to the joined text on the next edit.

Every field also takes `description`, `defaultValue` and `hidden`. Refer to
[Options every field takes](./field-plugins.md#options-every-field-takes).

> `required`, `min`, `max` and `pattern` are no longer config keys. They are
> validators that a core plugin registers, and a collection attaches them with
> `validators`. Refer to
> [Validation in two layers](./field-plugins.md#validation-in-two-layers).


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

These conditions are important:


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

`StringField` (`string-field.ui.tsx`) has no props. It reads its address, schema
options, value and frame (label, required, errors) from hooks, and it renders
`StringFieldView` (`string-field.view.tsx`). The view puts an `Input` or a
`Textarea` inside `FieldWrapper`. It sets `aria-invalid` when there are errors.
A disabled box does not fade a second time, because the wrapper already fades it.

```tsx
export function StringField() {
  const address = useFieldAddress();
  const { multiline, mono, placeholder } = useFieldSchema<StringFieldSchema>();
  const [value, setValue] = useFieldValue<string>(address);
  const frame = useFieldFrame();
  const boxRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useFieldActivation(() => boxRef.current?.focus());

  return (
    <StringFieldView
      {...frame}
      ref={(box) => {
        boxRef.current = box;
      }}
      id={address}
      value={value ?? ''}
      onChange={setValue}
      multiline={multiline}
      mono={mono}
      placeholder={placeholder}
    />
  );
}
```

The view also takes `disabled`, `readOnly`, `help` and `warnings`. No schema key
sets them yet, so only `string-field.states.ts` uses them. That file lists every
look of the field, and a test renders each one.

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
