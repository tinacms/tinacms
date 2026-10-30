# The `number` field

The `number` field is one of the field plugins that v4 supplies. Its editor is a short
number box with step buttons inside the Field wrapper. The document stores a
number, but the editor holds the raw input string. The source code is in `plugins/fields/number/`.

## Authoring

`t.number({...})` adds `type: 'number'` (`NUMBER_FIELD_TYPE`) to the config:

```ts
import { t } from '@tinacms/tinacms';

const collection = {
  name: 'post',
  fields: [
    t.number({ name: 'rating', label: 'Rating', validators: [required(), min(1), max(5)], step: 0.5 }),
  ],
};
```

The config (`NumberFieldSchema`, which extends `BaseFieldSchema`):

| Key | Type | Effect |
|---|---|---|
| `name` | `string` (necessary) | The field key in the document. It is also the alternative label. |
| `label` | `string` | The label on the screen. The validation messages use it. |
| `step` | `number` | The increase of the step buttons and the arrow keys (`1` when unset or not above zero). The `step` attribute of the input stays `step ?? 'any'`. It has no validation function. |

> `required`, `min`, `max` and `pattern` are no longer config keys. They are
> validators that a core plugin registers, and a collection attaches them with
> `validators`. Refer to
> [Validation in two layers](./field-plugins.md#validation-in-two-layers).


## The descriptor

The client segment (`number-field.client.tsx`) takes the `number` key:

```tsx
defineClientPlugin({
  field: {
    Component: NumberField,
    // no defaultValue — an absent field starts as null and is not saved
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

An empty value is `null`. The conversion occurs in one location only: the
`onChange` function of the component changes `''` to `null`. The field has
no `defaultValue`. `digestDocument` removes the `null` values before it
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
| — | A string that is not a number becomes `NaN` | `<label> must be a number` |

Zero passes the `required` rule, because zero is a value and is not empty.
Negative values and decimal values do not change during ingest and digest. An
optional empty value passes as `.optional()`. These rules run on the shared path
(`validateField`). Refer to
[`field-plugins.md`](./field-plugins.md#validation-in-two-layers).

## The component

`NumberField` (`number-field.ui.tsx`) has no props. It holds the hooks
(`useFieldAddress`, `useFieldSchema`, `useFieldValue`, `useFieldFrame`,
`useFieldActivation`) and feeds `NumberFieldView` (`number-field.view.tsx`).
The view holds no editor state. It draws the box (`w-28 max-w-full`) inside
`FieldWrapper`, and two step buttons ("Increase", "Decrease") at the end of the
box. The buttons are skipped by Tab, and they are absent when the field is
disabled or read-only.

### Limits

The limits come from the `min` and `max` validators. `limitOf(node, 'min' | 'max')`
(`number-field.step.ts`) reads the first number argument of the first matching
validator. Only the stepping uses it. The validators give the error message.
The native `min` and `max` attributes are not set.

### Stepping

`stepValue` (`number-field.step.ts`) is the one pure function behind the buttons
and ArrowUp / ArrowDown. A step writes `String(result)`:

- A number is moved by the step and clamped to the limits. It rounds to the larger
  number of decimals of the value and the step (`0.1` + `0.2` = `0.3`).
- An empty box steps up to `min` (else the step), and down to `max` (else minus the
  step).
- At or past a limit, that direction does nothing and its button is disabled.
  The other direction clamps (`7` with `max(5)` steps down to `5`).
- A value typed past a limit stays in the box. The validator shows the error after
  blur.

## States

`number-field.states.ts` lists every look as `numberFieldStates`.
`number-field.states.test.tsx` renders each one.

## The connections

- The manifest is `number-field.plugin.ts`. Its name is `tina:field:number`, and
  it exports `numberFieldPlugin`.
- The registration is in `plugins/fields/index.ts`. That file adds the plugin to
  `corePlugins`, and it supplies `t.number`.

## Tests

`number-field.test.tsx` does these tests:

- It renders the value, and this includes a stored zero.
- It connects `step` to the input, and steps with the buttons and the arrow keys.
- It accepts decimal keystrokes and negative keystrokes.
- It applies the `min` limit and the `max` limit.
- It makes sure that zero is not an empty value when `required` is true.
- It makes sure that a string that is not a number does not pass.
- It converts values with ingest, then converts them again with digest.
- It makes sure that a `null` value and an empty value become absent.
- It examines the metadata of the descriptor in the registry.
