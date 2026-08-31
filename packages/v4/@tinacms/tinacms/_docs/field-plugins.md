# Field plugins

A field plugin renders one schema field `type`, and it validates that field.

A field plugin supplies the `field` capability at a key. Its key is the schema
`type` that it controls. Many field plugins can operate at the same time. The
registry holds one descriptor for each type.

## The four files

Each field plugin has four small files. Give each file the name of the `type`
that the plugin controls, in the format `<type>-field.*`:

| File | Role |
|---|---|
| `<type>-field.plugin.ts` | The manifest: `definePlugin({ name, provides:['field'], field: { type, contractVersion }, client })` |
| `<type>-field.schema.ts` | The `t.<type>()` helper function for authors, and its Zod validator |
| `<type>-field.client.tsx` | The client segment: `defineClientPlugin({ field: descriptor })` |
| `<type>-field.ui.tsx` | The React component that the editor renders |

The files are separate for one reason. The browser bundle gets the large UI file
(`.ui.tsx`) only when the `client()` import of the plugin operates.

The `string` field (`plugins/fields/string/`) is the example in the sections
below. Use your own `type` in place of `string`. For the config options and the
validation rules of that field, refer to [`string-field.md`](./string-field.md).

For a complete, working field plugin in one file — manifest, descriptor, and
component together — copy `packages/v4/examples/barebones/tina/rating-field.tsx`.
It defines a five-star rating field end to end, including the `field: { type,
contractVersion }` manifest property that the sections below walk through.

v4 supplies four more examples:

- The `boolean` field ([`boolean-field.md`](./boolean-field.md)) is a checkbox
  with two states. For that field, `required` has no effect.
- The `number` field ([`number-field.md`](./number-field.md)) holds a string
  value in the editor and a numeric value in the document. `parse` and
  `serialize` do the conversion. The field reads its own config option, `step`,
  with `useFieldSchema`.
- The `datetime` field ([`datetime-field.md`](./datetime-field.md)) holds a
  string on both sides. It defines `parse`, but no `serialize` and no
  `defaultValue`.
- The `select` field ([`select-field.md`](./select-field.md)) picks one value
  from a fixed `options` list. Its Zod validator is a `z.enum` with a custom
  `errorMap`, and it has no `defaultValue`, `parse`, or `serialize`.
- The `rich-text` field ([`rich-text-field.md`](./rich-text-field.md)) uses the
  `block` layout. With `isBody`, it controls the markdown body of the file.

### 1. The manifest (`.plugin.ts`)

```ts
import { definePlugin } from '../../../core/plugin';
import { STRING_FIELD_TYPE } from './string-field.schema';

export default definePlugin({
  name: 'tina:field:string',
  provides: ['field'],
  field: { type: STRING_FIELD_TYPE, contractVersion: 1 },
  client: () => import('./string-field.client'),
});
```

`name` can be any unique string. The built-in Tina plugins use the convention
`tina:<capability>:<key>`. In this example the name is `tina:field:string`. The
capability is `field`, and the key is `string`.

`field` is necessary for a field plugin. It has two properties: `type`, the
schema type this plugin owns and the registry key, and `contractVersion`, a
number the codegen lock file records for that type
(`codegen/compile-schema.ts`). Without `field`, the registry throws
`field-plugin-no-provision` (`core/field/registry.ts`) as soon as the client
segment resolves a descriptor.

### 2. The client segment and the descriptor (`.client.tsx`)

The `field` property of the segment is a `FieldDescriptor`
(`core/field/contract.ts`):

```tsx
import { defineClientPlugin } from '../../../client';
import { stringSchema } from './string-field.schema';
import { StringField } from './string-field.ui';

export default defineClientPlugin({
  field: {
    Component: StringField,
    defaultValue: '',
    metadata: { layout: 'inline' }, // 'inline' | 'block' layout hint
    schema: stringSchema,           // node -> ZodType, run by the form resolver
  },
});
```

The descriptor does not carry `type`. The registry key comes from the
manifest's `field.type` (step 1) — the resolver assigns this descriptor to
that key (`core/field/registry.ts`).

The properties of the descriptor:

- `Component` (necessary) — It has no props. It gets all its data from the
  hooks below.
- `defaultValue` — The initial value for a new or absent field, applied on
  ingest.
- `metadata.layout` — The layout hint: `inline` or `block`.
- `metadata.labelable` — Set it to `false` to hide the outer field label. The
  `rich-text` field sets it to `false` because it renders its own label area.
- `schema(node)` — It returns a Zod schema for the validation in layer 1.
- `validate(value)` — A custom check for layer 2. It returns `string` or `null`.
- `parse` and `serialize` — Optional conversions between the stored value and
  the editor value. Do not add them if the two values are the same. Each one
  also receives the field's own schema node and a `FieldTransformContext`
  (`core/field/contract.ts`) as a second and third argument:
  `parse(stored, node, context)` and `serialize(value, node, context)`. Use
  them when the conversion depends on the field's config — the `rich-text`
  field reads `templates` off the node to parse markdown. Ignore them when the
  conversion is value-only, as `number` does.
- `isEqual` — An optional custom equality check,
  `isEqual(a, b, node, context) => boolean`. The form calls it instead of
  structural equality when it decides whether a field's value changed
  (`core/form/compare.ts`). The `rich-text` field uses it to treat two AST
  values as equal when they serialize to the same markdown source.

### 3. The schema helper function and the validator (`.schema.ts`)

`t.string({...})` is the typed function that authors call in a collection. It
adds `type: 'string'` to the config. The related function `stringSchema(node)`
converts `required`, `min`, `max`, and `pattern` into Zod rules.

```ts
export const string = (config: Omit<StringFieldSchema, 'type'>): StringFieldSchema =>
  ({ ...config, type: 'string' });
```

### 4. The component (`.ui.tsx`)

The component gets its address and its resolved schema node from the context.
`<Field>` supplies both of them. The component gets the value and the errors
from hooks that use the address (`editor/hooks.ts`). The component has no
`value` prop and no `onChange` prop. Thus each field is one react-hook-form
subscription, and a keystroke does not render the full form again.

```tsx
import { useRef } from 'react';
import {
  useFieldActivation, useFieldAddress, useFieldErrors, useFieldValue,
} from '../../../editor';

export function StringField() {
  const address = useFieldAddress();
  const [value, setValue] = useFieldValue<string>(address);
  const errors = useFieldErrors(address);
  const inputRef = useRef<HTMLInputElement>(null);

  useFieldActivation(() => inputRef.current?.focus()); // opt-in focus when active

  return (
    <div>
      <input ref={inputRef} id={address} value={value ?? ''}
        onChange={(e) => setValue(e.target.value)} />
      {errors.map((e) => <span key={e} role='alert'>{e}</span>)}
    </div>
  );
}
```

Hooks:

| Hook | Function |
|---|---|
| `useFieldAddress()` | Gives the address of this field |
| `useFieldSchema<T>()` | Gives the resolved schema node of this field, which holds the render hints such as `step` |
| `useFieldValue<T>(address)` | Gives `[value, setValue]` from the react-hook-form controller |
| `useFieldErrors(address)` | Gives the validation messages at the address |
| `useFieldActivation(handler)` | Runs `handler` when this field becomes the active field, for visual editing |

## Validation in two layers

The form resolver (`editor/resolver.ts`) calls `validateField`
(`core/validation.ts`). `validateField` runs the two layers and joins their
messages:

1. **Zod** — `descriptor.schema(node).safeParse(value)`. This layer applies the
   `required`, `min`, `max`, and `pattern` rules.
2. **Custom** — `descriptor.validate(value)`. This layer returns one message or
   `null`.

## Replace a built-in field

If you register a second plugin at a `type` that is already in use, the registry
throws an error (`core/field/registry.ts`). To prevent the error, declare the
override:

```ts
definePlugin({
  name: 'my:field:string',
  provides: ['field'],
  field: { type: 'string', contractVersion: 1 },
  client: () => import('./my-string.client'),
  overrides: [{ capability: 'field', key: 'string' }],
});
```

## Write a new field plugin

This example makes a color field:

1. Make the folder `plugins/fields/color/` with the four files above.
2. In `.plugin.ts`, set `field.type` to `'color'`. In `.client.tsx`, use an
   `<input type="color">` component. Set `defaultValue` to `'#000000'`. Add an
   optional `validate` function for the hexadecimal value.
3. In `.schema.ts`, write the `color()` helper function. It adds
   `type: 'color'`.
4. Add the plugin to `corePlugins`, and add `color` to `t`. Both are in
   `plugins/fields/index.ts`.

Do no more steps. You do not change the registry.

## Addresses

`<Field>` compares `address` to the field `name` in the collection
(`editor/field.tsx`). The two values must be the same. `useFieldErrors` uses
that same name as the key of the errors.
