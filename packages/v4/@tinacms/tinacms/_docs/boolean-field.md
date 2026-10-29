# The `boolean` field

The `boolean` field is one of the field plugins that v4 supplies. It is a
checkbox with its label beside it and its help under the label, and a Zod type
guard checks the value.

## Files

The files are in `plugins/fields/boolean/`:

| File | Role |
|---|---|
| `boolean-field.schema.ts` | The `t.boolean()` helper function, and the `booleanSchema` guard |
| `boolean-field.client.tsx` | The descriptor, which takes the `boolean` key |
| `boolean-field.ui.tsx` | The `BooleanField` editor component: reads the address, value and frame from the editor hooks |
| `boolean-field.view.tsx` | `BooleanFieldView`: the checkbox, label and help, from props only |
| `boolean-field.states.ts` | The state catalogue: every look, with a lookup by name |
| `boolean-field.states.test.tsx` | One render test over every state, plus the toggle and inert tests |
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

`BooleanFieldSchema` extends `BaseFieldSchema` and adds nothing: `name` is the
field key and the alternative label, and `label` is the text beside the box. It
has no `min`, `max`, or `pattern` property, because a boolean value has no
constraints. A `required` validator on the field has no effect, and the field
shows no star. The next section gives the reason.

## The descriptor

The client segment (`boolean-field.client.tsx`) takes the `boolean` key:

```tsx
defineClientPlugin({
  field: {
    Component: BooleanField,
    defaultValue: false,      // seeds a new/absent field on ingest
    metadata: { layout: 'inline' },
    schema: booleanSchema,
  },
});
```

The descriptor does not carry `type`. `boolean-field.plugin.ts` claims the
`boolean` key with `field: { type: BOOLEAN_FIELD_TYPE, contractVersion: 1 }`
on the manifest (see
[`field-plugins.md`](./field-plugins.md#2-the-client-segment-and-the-descriptor-clienttsx)).

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

Thus the field adds no rule for `required`. The toggle field of v3 rejected `undefined` and `null`, and it had
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
the context, and the value and the frame from hooks that use the address. It
passes them to `BooleanFieldView`, which takes props only. A change to the
checkbox renders this field again, but does not render the other fields again.

```tsx
export function BooleanField() {
  const address = useFieldAddress();
  const [value, setValue] = useFieldValue<boolean>(address);
  const frame = useFieldFrame();
  const inputRef = useRef<HTMLButtonElement>(null);

  useFieldActivation(() => inputRef.current?.focus()); // focus when active

  return (
    <BooleanFieldView {...frame} ref={inputRef} id={address}
      checked={value ?? false} onChange={setValue} />
  );
}
```

The view draws the label beside the checkbox and the help under the label, so it
does not give them to the Field wrapper, which would put them above the control.
The wrapper still draws the warnings and the errors below the row. The field is
never required and never empty, so no star shows. There is no unsaved marker.
A real error (a stored value that is not a boolean, or a custom validator)
shows under the field, and the checkbox gets `aria-invalid`.

The help uses `FieldHelp` from the Field wrapper, so it has the same look as
the help of the other fields. The label points at the checkbox, and the
checkbox points at the help with `aria-describedby` only when help exists.

## States and keys

`boolean-field.states.ts` lists every look: `on`, `off`, `disabled`,
`read-only`, `long label`, `help and warning` and `error`. The render test runs
over the list. Help, warnings, disabled and read-only come from the catalogue
only. The editor frame supplies none of them yet, as with the Number field.

- Disabled fades the field once, with a plain border and a grey tick.
- Read-only shows a grey fill with the tick, and sets `aria-readonly`.
- Disabled and read-only ignore a click on the box or the label, and Space and
  Enter. They do not change on hover.
- Space toggles the focused box. Enter toggles it too, once: the view handles
  Enter itself, because the base checkbox ignores it, and it ignores key repeat.
- The focus ring shows on keyboard focus only, not on a click.

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
- It focuses the checkbox when the field is activated.

`boolean-field.states.test.tsx` renders every state from the catalogue, and
checks that disabled and read-only ignore input, that a label click, Space and
Enter each toggle once, and that Enter key repeat does not toggle again.
