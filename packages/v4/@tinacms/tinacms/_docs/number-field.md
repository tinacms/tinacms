# The `number` field

A shipped field plugin: a numeric `<input type="number">` whose **stored value is
a number** but whose **editor value is the raw input string**. Source:
`plugins/fields/number/`.

## Authoring

`t.number({...})` stamps `type: 'number'` (`NUMBER_FIELD_TYPE`) onto the config:

```ts
import { t } from '@tinacms/tinacms';

const collection = {
  name: 'post',
  fields: [
    t.number({ name: 'rating', label: 'Rating', required: true, min: 1, max: 5, step: 0.5 }),
  ],
};
```

Config (`NumberFieldSchema`, extends `BaseFieldSchema`):

| Key | Type | Effect |
|---|---|---|
| `name` | `string` (required) | field key in the document; also the fallback label |
| `label` | `string` | display label; used in validation messages |
| `required` | `boolean` | empty value fails validation |
| `min` | `number` | minimum **value** (not length) |
| `max` | `number` | maximum **value** |
| `step` | `number` | the input's `step` (render hint; no validation role) |

## Editor value vs stored value

The DOM gives `<input type="number">` a **string**, but the document stores a
**number**. The descriptor bridges them, so partial entries (`-`, `1.`) survive
typing and the document always gets a clean number back:

```ts
parse: (stored) => (stored == null ? undefined : String(stored)),  // load: number → string
serialize: (value) => Number(value),                                // save: string → number
```

Empty is `undefined`, converted in **one place** — the component's `onChange`
(`'' → undefined`). There is no `defaultValue`, and `digestDocument` drops
`undefined` before calling `serialize`, so `serialize` only ever sees a real
string and returns a strict `number` (never `number | undefined`); an empty field
is omitted from the saved document. A stored `null` is normalised to empty by
`parse`, so it round-trips as absent rather than `"null"`/`NaN`.

## Validation

`numberSchema(node)` coerces the editor string, then applies the bounds. The
coercion guards empty explicitly — never a falsy test, since `0` is valid and
`Number('') === 0` would smuggle empty in as zero:

| Config | Rule | Message |
|---|---|---|
| `min` | `.min(min)` | `<label> must be at least <min>` |
| `max` | `.max(max)` | `<label> must be at most <max>` |
| `required` | empty (`undefined`) fails `z.number()` | `<label> is required` |
| — | a non-numeric string coerces to `NaN` | `<label> must be a number` |

Zero passes `required` (present, not empty); negatives/decimals round-trip
unchanged; an optional empty value passes as `.optional()`. Runs through the
shared path (`validateField`); see
[`field-plugins.md`](./field-plugins.md#validation--two-layers).

## Component

`NumberField` (`number-field.ui.tsx`) takes **no props** — it reads value/errors
through address-keyed hooks and its own node through `useFieldSchema` to wire
`step`:

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

## Where it's wired

- Manifest: `number-field.plugin.ts` — `tina:field:number`, exported as
  `numberFieldPlugin`.
- Registration: `plugins/fields/index.ts` adds it to `corePlugins` and exposes
  `t.number`.

## Tests

`number-field.test.tsx` covers rendering (including a stored zero), the `step`
wiring, decimal/negative keystrokes, min/max bounds, zero-is-not-empty under
`required`, non-numeric rejection, ingest/digest round-trips, null/empty →
absent, and the registered descriptor metadata.
```
