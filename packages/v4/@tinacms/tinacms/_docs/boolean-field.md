# The `boolean` field

The `boolean` field is one of the field plugins that v4 supplies. It is one
checkbox, and a Zod type guard checks the value.

## Files

The four files are in `plugins/fields/boolean/`:

| File | Role |
|---|---|
| `boolean-field.schema.ts` | The `t.boolean()` helper function, and the `booleanSchema` guard |
| `boolean-field.client.tsx` | The descriptor, which takes the `boolean` key |
| `boolean-field.ui.tsx` | The `BooleanField` checkbox component |
| `boolean-field.plugin.ts` | The manifest, `tina:field:boolean` |

## Authoring

`t.boolean({...})` adds `type: 'boolean'` (`BOOLEAN_FIELD_TYPE`) to the config:

```ts
import { t } from '@tinacms/tinacms';

const collection = {
  name: 'post',
  fields: [t.boolean({ name: 'featured', label: 'Featured' })],
};
```

`BooleanFieldSchema` extends `BaseFieldSchema`. It has three properties: `name`,
which is the field key and the alternative label; `label`; and `required`. It
has no `min`, `max`, or `pattern` property, because a boolean value has no
constraints. The config accepts `required`, but `required` has no effect. The
next section gives the reason.

## The descriptor

The client segment (`boolean-field.client.tsx`) takes the `boolean` key:

```tsx
defineClientPlugin({
  field: {
    type: 'boolean',          // BOOLEAN_FIELD_TYPE
    Component: BooleanField,
    defaultValue: false,      // seeds a new/absent field on ingest
    metadata: { layout: 'inline' },
    schema: booleanSchema,
  },
});
```

The descriptor has no `validate`, `parse`, or `serialize` function. TinaCMS
stores the value without a change, as a JSON boolean or a YAML boolean.

## The two states, and the effect on `required`

A boolean value is `true` or `false`. `false` is a correct value, and it is not
an empty value. The checkbox cannot show a third state for "no answer". Thus the
field starts with `defaultValue: false`, and it always shows a definite value.

For these reasons, `required` cannot do a useful check:

- If `required` rejected `false`, the message would be "you must select this
  box". That message mixes a deliberate "no" with an empty value.
- If `required` rejected an unset value, the user would have to select the box.
  Then the user would release it to make the value `false`.

Thus `BaseFieldSchema` supplies the `required` property, but the field adds no
rule for it. The toggle field of v3 rejected `undefined` and `null`, and it had
this problem. v4 does not repeat it.

## Validation

`booleanSchema` is a type guard, and it is not a set of constraints. It ignores
the node. It only makes sure that the stored value is a boolean:

```ts
export const booleanSchema = (_node: FieldSchema): ZodType =>
  z.preprocess((v) => (v == null ? undefined : v), z.boolean().optional());
```

`true` and `false` pass the check. The schema changes `undefined` and `null` to
`undefined`, and they pass as optional values. A value that is not a boolean,
for example `'yes'`, does not pass the check. These rules run on the shared path
(`validateField`). A `validate(value)` function in the descriptor can add custom
rules.

## Ingest and digest

At load, `ingestDocument` uses the default value `false` if the document has no
value. Thus the checkbox always starts with a value. If the document has a
boolean value, `ingestDocument` uses that value without a change, because the
field has no `parse` function. Then the checkbox makes only `true` or `false`.
At save, `digestDocument` writes that boolean value to the document. The field
has no `parse` or `serialize` function, thus the shared ingest path and digest
path do not change the values.

## The component

`BooleanField` (`boolean-field.ui.tsx`) has no props. It reads its address from
the context. It gets the value and the errors from hooks that use the address.
Thus a change to the checkbox renders this field again, but does not render the
other fields again.

```tsx
export function BooleanField() {
  const address = useFieldAddress();
  const [value, setValue] = useFieldValue<boolean>(address);
  const errors = useFieldErrors(address);
  const inputRef = useRef<HTMLInputElement>(null);

  useFieldActivation(() => inputRef.current?.focus()); // focus when active

  return (
    <div>
      <input ref={inputRef} type='checkbox' aria-label={address}
        checked={value ?? false}
        onChange={(e) => setValue(e.target.checked)} />
      {errors.map((e) => <span key={e} role='alert'>{e}</span>)}
    </div>
  );
}
```

## The connections

- The manifest is `boolean-field.plugin.ts`. Its name is `tina:field:boolean`,
  and it exports `booleanFieldPlugin`.
- The registration is in `plugins/fields/index.ts`. That file adds the plugin to
  `corePlugins`, and it supplies `t.boolean`.

## Tests

`boolean-field.test.tsx` does these tests:

- It renders a `true` value, a `false` value, and an absent value.
- It changes the checkbox, then reads the new value from the store.
- It makes sure that `required` has no effect. `true` and `false` both pass.
- It makes sure that a value that is not a boolean does not pass.
- It converts `true` and `false` with ingest, then converts them again with
  digest. It also seeds the default value when the document has no value.
- It examines the metadata of the descriptor.
