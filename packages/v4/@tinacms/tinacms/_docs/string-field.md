# The `string` field

The field plugin v4 ships, and the worked example behind
[`field-plugins.md`](./field-plugins.md). Single-line text, backed by a Zod
validator. Source: `plugins/fields/string/`.

## Authoring

`t.string({...})` is the typed builder you call in a collection. It stamps
`type: 'string'` onto the config (`STRING_FIELD_TYPE`):

```ts
import { t } from '@tinacms/tinacms';

const collection = {
  name: 'post',
  fields: [
    t.string({ name: 'title', label: 'Title', required: true, min: 3 }),
  ],
};
```

Config (`StringFieldSchema`, extends `BaseFieldSchema`):

| Key | Type | Effect |
|---|---|---|
| `name` | `string` (required) | field key in the document; also the fallback label |
| `label` | `string` | display label; used in validation messages |
| `required` | `boolean` | empty value fails validation (see below) |
| `min` | `number` | minimum length |
| `max` | `number` | maximum length |
| `pattern` | `string` | `RegExp` source the value must match |

## Descriptor

The client segment (`string-field.client.tsx`) claims the `string` key:

```tsx
defineClientPlugin({
  field: {
    type: 'string',           // STRING_FIELD_TYPE
    Component: StringField,
    defaultValue: '',         // seeds a new/absent field on ingest
    metadata: { layout: 'inline' },
    schema: stringSchema,     // node -> ZodType
  },
});
```

It defines no `validate`, `parse`, or `serialize`: the value is stored as-is and
all rules live in `schema`.

## Validation

`stringSchema(node)` (`string-field.schema.ts`) compiles the config into a Zod
schema. Messages use `label ?? name`:

| Config | Rule | Message |
|---|---|---|
| `min` | `.min(min)` | `<label> must be at least <min> characters` |
| `max` | `.max(max)` | `<label> must be at most <max> characters` |
| `pattern` | `.regex(...)` | `<label> is invalid` |
| `required` | `.min(1)` *(only if no positive `min` already)* | `<label> is required` |

Edge cases worth knowing:

- **`required` + `min`** — when `min > 0` is set, `required` adds no separate
  rule; the `min` message covers the empty case. A required field with no `min`
  gets `.min(1, "<label> is required")`.
- **Optional fields** — `''` and `null` are preprocessed to `undefined` and pass
  as `.optional()`; an empty optional string is valid.
- **Invalid `pattern`** — a `pattern` that isn't a valid `RegExp` is skipped, so
  no pattern constraint is applied.
- **Per-field scope** — `stringSchema` validates against this field's node alone.

This runs through the shared two-layer path (`validateField` →
`descriptor.schema` then `descriptor.validate`); see
[`field-plugins.md`](./field-plugins.md#validation--two-layers).

## Component

`StringField` (`string-field.ui.tsx`) takes **no props** — it reads its address
from context and pulls value/errors through address-keyed hooks, so a keystroke
re-renders only this field:

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

## Where it's wired

- Manifest: `string-field.plugin.ts` — `definePlugin({ name: 'tina:field:string',
  provides: ['field'], client: () => import('./string-field.client') })`,
  exported as `stringFieldPlugin`.
- Registration: `plugins/fields/index.ts` adds it to `corePlugins` and exposes
  `t.string`.

## Tests

`string-field.test.tsx` covers rendering the ingested value, default-value
fallback, keystroke writes, the shared min-length message, ingest/digest
round-trips (including null-vs-absent), and the registered descriptor metadata.
