# The `number` field

The `number` field is one of the field plugins that v4 supplies. It is an
`<input type="number">` element. The document stores a number, but the editor
holds the raw input string. The source code is in `plugins/fields/number/`.

## Authoring

`t.number({...})` adds `type: 'number'` (`NUMBER_FIELD_TYPE`) to the config:

```ts
import { t } from '@tinacms/tinacms';

const collection = {
  name: 'post',
  fields: [
    t.number({ name: 'rating', label: 'Rating', required: true, min: 1, max: 5, step: 0.5 }),
  ],
};
```

The config (`NumberFieldSchema`, which extends `BaseFieldSchema`):

| Key | Type | Effect |
|---|---|---|
| `name` | `string` (necessary) | The field key in the document. It is also the alternative label. |
| `label` | `string` | The label on the screen. The validation messages use it. |
| `required` | `boolean` | An empty value does not pass validation. |
| `min` | `number` | The minimum **value**, and not the minimum length |
| `max` | `number` | The maximum **value** |
| `step` | `number` | The `step` attribute of the input. It is a render hint, and it has no validation function. |

## The descriptor

The client segment (`number-field.client.tsx`) takes the `number` key:

```tsx
defineClientPlugin({
  field: {
    Component: NumberField,
    // no defaultValue — an absent field stays absent
    metadata: { layout: 'inline' },
    schema: numberSchema,
    parse: (stored) => (stored == null ? undefined : String(stored)),  // load: number → string
    serialize: (value) => Number(value),                               // save: string → number
  },
});
```

The descriptor does not carry `type`. `number-field.plugin.ts` claims the
`number` key with `field: { type: NUMBER_FIELD_TYPE, contractVersion: 1 }`
on the manifest (see
[`field-plugins.md`](./field-plugins.md#2-the-client-segment-and-the-descriptor-clienttsx)).

## The editor value and the stored value

The `<input type="number">` element gives a string, but the document stores a
number. `parse` and `serialize` do the conversion. Thus the editor keeps an
incomplete entry such as `-` or `1.` while the user types, and the document
always gets a correct number.

An empty value is `undefined`. The conversion occurs in one location only: the
`onChange` function of the component changes `''` to `undefined`. The field has
no `defaultValue`. `digestDocument` removes the `undefined` values before it
calls `serialize`. Thus `serialize` always gets a real string and returns a
`number`. It never returns `number | undefined`. The saved document does not
contain an empty field. `parse` changes a stored `null` value to an empty value.
Thus the field becomes absent, and it does not become `"null"` or `NaN`.

## Validation

`numberSchema(node)` converts the editor string to a number, then applies the
limits. The conversion tests for an empty value directly, and it does not use a
falsy test. Zero is a correct value, and `Number('') === 0`. Thus a falsy test
would change an empty value into zero.

| Config | Rule | Message |
|---|---|---|
| `min` | `.min(min)` | `<label> must be at least <min>` |
| `max` | `.max(max)` | `<label> must be at most <max>` |
| `required` | An empty value (`undefined`) does not pass `z.number()` | `<label> is required` |
| — | A string that is not a number becomes `NaN` | `<label> must be a number` |

Zero passes the `required` rule, because zero is a value and is not empty.
Negative values and decimal values do not change during ingest and digest. An
optional empty value passes as `.optional()`. These rules run on the shared path
(`validateField`). Refer to
[`field-plugins.md`](./field-plugins.md#validation-in-two-layers).

## The component

`NumberField` (`number-field.ui.tsx`) has no props. It gets the value and the
errors from hooks that use the address. It gets its own node with
`useFieldSchema`, and it connects `step` to the input:

```tsx
export function NumberField() {
  const address = useFieldAddress();
  const field = useFieldSchema<NumberFieldSchema>();
  const [value, setValue] = useFieldValue<string | undefined>(address);
  const errors = useFieldErrors(address);
  const inputRef = useRef<HTMLInputElement>(null);

  useFieldActivation(() => inputRef.current?.focus());

  return (
    <div>
      <input ref={inputRef} type='number' step={field.step} aria-label={address}
        value={value ?? ''}
        onChange={(e) => setValue(e.target.value === '' ? undefined : e.target.value)} />
      {errors.map((e) => <span key={e} role='alert'>{e}</span>)}
    </div>
  );
}
```

## The connections

- The manifest is `number-field.plugin.ts`. Its name is `tina:field:number`, and
  it exports `numberFieldPlugin`.
- The registration is in `plugins/fields/index.ts`. That file adds the plugin to
  `corePlugins`, and it supplies `t.number`.

## Tests

`number-field.test.tsx` does these tests:

- It renders the value, and this includes a stored zero.
- It connects `step` to the input.
- It accepts decimal keystrokes and negative keystrokes.
- It applies the `min` limit and the `max` limit.
- It makes sure that zero is not an empty value when `required` is true.
- It makes sure that a string that is not a number does not pass.
- It converts values with ingest, then converts them again with digest.
- It makes sure that a `null` value and an empty value become absent.
- It examines the metadata of the descriptor in the registry.
