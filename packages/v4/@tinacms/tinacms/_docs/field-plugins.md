# Field plugins

A field plugin teaches TinaCMS how to render and validate one schema field
`type`.

A field plugin provides the `field` capability **at a key** — its key is the
schema `type` it owns. Many coexist; the registry holds one descriptor per type.

## Anatomy

Every field plugin is four small files, conventionally named for the `type` it
owns (`<type>-field.*`):

| File | Role |
|---|---|
| `<type>-field.plugin.ts` | the manifest — `definePlugin({ name, provides:['field'], client })` |
| `<type>-field.schema.ts` | the `t.<type>()` authoring helper + its Zod validator |
| `<type>-field.client.tsx` | the **client segment** — `defineClientPlugin({ field: descriptor })` |
| `<type>-field.ui.tsx` | the React component the editor renders |

The split exists so the heavy UI (`.ui.tsx`) is only pulled into the browser
bundle when the plugin's `client()` import runs.

The shipped `string` field (`plugins/fields/string/`) is the worked example
below — substitute your own `type` for `string` throughout. For that field's
exact config options and validation semantics, see
[`string-field.md`](./string-field.md). The shipped `boolean` field
([`boolean-field.md`](./boolean-field.md)) is a second example — a two-state
checkbox where `required` is a no-op. The shipped `number` field
([`number-field.md`](./number-field.md)) is a third — a string editor value ↔
numeric stored value via `parse`/`serialize`, reading its own config
(`step`) through `useFieldSchema`.

### 1. Manifest (`.plugin.ts`)

```ts
import { definePlugin } from '../../../core/plugin';

export default definePlugin({
  name: 'tina:field:string',
  provides: ['field'],
  client: () => import('./string-field.client'),
});
```

`name` can be any unique string. Tina's built-in plugins follow the convention
`tina:<capability>:<key>` — here `tina:field:string` (capability `field`, key
`string`).

### 2. Client segment + descriptor (`.client.tsx`)

The segment's `field` is a `FieldDescriptor` (`core/field/contract.ts`). This is
what actually claims the `type` key:

```tsx
import { defineClientPlugin } from '../../../client';
import { STRING_FIELD_TYPE, stringSchema } from './string-field.schema';
import { StringField } from './string-field.ui';

export default defineClientPlugin({
  field: {
    type: STRING_FIELD_TYPE,        // ← the registry key
    Component: StringField,
    defaultValue: '',
    metadata: { layout: 'inline' }, // 'inline' | 'block' layout hint
    schema: stringSchema,           // node -> ZodType, run by the form resolver
  },
});
```

Descriptor fields:

- `type` (required) — the schema `type` this renders. Registry key.
- `Component` (required) — takes **no props**; pulls everything from hooks (below).
- `defaultValue` — seed for a new document.
- `metadata.layout` — `inline`/`block` layout hint.
- `schema(node)` — returns a Zod schema for layer-1 validation.
- `validate(value)` — layer-2 custom check, returns `string | null`.
- `parse` / `serialize` — optional stored↔value transforms; omit them for an
  identity mapping.

### 3. Schema helper + validator (`.schema.ts`)

`t.string({...})` is the typed builder authors call in a collection. It just
stamps `type: 'string'` onto the config. The matching `stringSchema(node)`
compiles `required` / `min` / `max` / `pattern` into Zod.

```ts
export const string = (config: Omit<StringFieldSchema, 'type'>): StringFieldSchema =>
  ({ ...config, type: 'string' });
```

### 4. The component (`.ui.tsx`)

The component receives **its address and its resolved schema node** via context
(both provided by `<Field>`) and pulls value/errors through address-keyed hooks
(`editor/hooks.ts`). No `value`/`onChange` props: that keeps each field an O(1)
react-hook-form subscription instead of re-rendering the whole form on a
keystroke.

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
      <input ref={inputRef} aria-label={address} value={value ?? ''}
        onChange={(e) => setValue(e.target.value)} />
      {errors.map((e) => <span key={e} role='alert'>{e}</span>)}
    </div>
  );
}
```

Hooks:

| Hook | Does |
|---|---|
| `useFieldAddress()` | this field's address |
| `useFieldSchema<T>()` | this field's resolved schema node (render hints, e.g. `step`) |
| `useFieldValue<T>(address)` | `[value, setValue]` via the RHF controller |
| `useFieldErrors(address)` | validation messages at the address |
| `useFieldActivation(handler)` | run `handler` when this becomes the active field (visual editing) |

## Validation — two layers

`validateField` (`core/validation.ts`), run from the form resolver
(`editor/resolver.ts`), runs both and concatenates the messages:

1. **Zod** — `descriptor.schema(node).safeParse(value)`. The declarative
   `required`/`min`/`max`/`pattern` rules.
2. **Custom** — `descriptor.validate(value)`, returns one message or `null`.

## Replacing a built-in

Registering a second plugin at an existing `type` throws — unless it declares
the override (`core/field/registry.ts`):

```ts
definePlugin({
  name: 'my:field:string',
  provides: ['field'],
  client: () => import('./my-string.client'),
  overrides: [{ capability: 'field', key: 'string' }],
});
```

## Write your own (e.g. a color field)

1. New folder `plugins/fields/color/` with the four files above.
2. `.client.tsx`: `type: 'color'`, a `<input type="color">` component,
   `defaultValue: '#000000'`, optional `validate` for hex.
3. `.schema.ts`: `color()` helper stamping `type: 'color'`.
4. Add the plugin to `corePlugins` and `color` to `t` in
   `plugins/fields/index.ts`.

That's the whole surface — no registry edits.

## Addressing

`<Field>` resolves `address` by exact field *name* against the collection
(`editor/field.tsx`), and `useFieldErrors` keys errors by that name.

