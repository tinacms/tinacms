# The `datetime` field

One of the field plugins v4 ships: an `<input type="datetime-local">` element.

## Files

All four live in `plugins/fields/datetime/`:

| File | Role |
|---|---|
| `datetime-field.schema.ts` | the `t.datetime()` helper + the `datetimeSchema` validator |
| `datetime-field.client.tsx` | the descriptor — claims the `datetime` key |
| `datetime-field.ui.tsx` | the `DatetimeField` component |
| `datetime-field.plugin.ts` | the manifest — `tina:field:datetime` |

## Authoring

`t.datetime({...})` stamps `type: 'datetime'` (`DATETIME_FIELD_TYPE`) onto the
config:

```ts
import { t } from '@tinacms/tinacms';

const collection = {
  name: 'post',
  fields: [
    t.datetime({ name: 'published', label: 'Published', required: true }),
  ],
};
```

`DatetimeFieldSchema` extends `BaseFieldSchema` — `name`, `label`, and
`required`. There's no `min`/`max`/`pattern`; a date has nothing else to
constrain.

## Descriptor

The client segment (`datetime-field.client.tsx`) claims the `datetime` key:

```tsx
defineClientPlugin({
  field: {
    Component: DatetimeField,
    metadata: { layout: 'inline' },
    schema: datetimeSchema,
    parse: (stored) => {
      if (stored instanceof Date) return stored.toISOString();
      return stored == null ? undefined : String(stored);
    },
  },
});
```

There's no `defaultValue` and no `serialize` — see below.

## Why there is no `defaultValue` and no `serialize`

- **`defaultValue`** — `datetime` follows the same rule as `number`: an absent
  field stays absent. `ingestDocument` seeds a field only when the descriptor
  sets `defaultValue` (`core/form/ingest.ts`); `datetime` opts out, so a
  document with no stored date shows an empty input instead of a fabricated
  one. This matches an established pattern, so it reads as deliberate.

- **`serialize`** — This one is not explained anywhere in the source.
  `parse` normalizes a stored `Date` instance (the shape a YAML frontmatter
  date parses to), or any other non-null value, to a string. But
  `digestDocument` writes a field's editor value straight to the document
  whenever `serialize` is absent (`core/form/ingest.ts`). The
  `datetime-local` input writes back exactly what the browser gives it — no
  seconds, no timezone offset, for example `2025-12-24T18:00`. So editing a
  field whose stored value was a full ISO string (for example
  `2024-05-01T09:30:00.000Z`) saves a shorter, offset-less string instead. No
  comment, ADR pointer, or test explains this asymmetry:
  `datetime-field.test.tsx` round-trips only an *unedited* stored value
  through ingest and digest, never an edited one. Treat this as an open
  question, not a documented design decision.

## Validation

`datetimeSchema(node)` (`datetime-field.schema.ts`) preprocesses the value,
then validates the result:

1. A `Date` instance becomes its ISO string (`value.toISOString()`).
2. `''`, `null`, and `undefined` become `undefined`.
3. Anything else passes through unchanged.

| Config | Rule | Message |
|---|---|---|
| — | The value must be a string | `<label> must be a date string` |
| — | The string must parse with `Date.parse` | `<label> must be a valid date` |
| `required` | An empty value (after step 2) fails the string check | `<label> is required` |
| — | An optional empty value passes as `.optional()` | — |

This runs through the shared path (`validateField`). Refer to
[`field-plugins.md`](./field-plugins.md#validation-in-two-layers).

## Component

`DatetimeField` (`datetime-field.ui.tsx`) takes no props — it reads its
address from context and pulls value/errors through address-keyed hooks:

```tsx
export function DatetimeField() {
  const address = useFieldAddress();
  const [value, setValue] = useFieldValue<string | undefined>(address);
  const errors = useFieldErrors(address);
  const inputRef = useRef<HTMLInputElement>(null);

  useFieldActivation(() => inputRef.current?.focus());

  return (
    <FieldWrapper errors={errors}>
      <Input
        ref={inputRef}
        type='datetime-local'
        id={address}
        aria-label={address}
        value={toInputValue(value)}
        onChange={(event) =>
          setValue(event.target.value === '' ? undefined : event.target.value)
        }
      />
    </FieldWrapper>
  );
}
```

`toInputValue` clips a stored value to what `datetime-local` accepts: the
first 16 characters of a datetime string (`YYYY-MM-DDTHH:mm`), and a
date-only string becomes midnight of that date.

Unlike `string`, `boolean`, and `number`, `DatetimeField` renders through the
shared `@tinacms/ui` `FieldWrapper`/`Input` components instead of a bare
`<div>`/`<input>` pair.

## Where it's wired

- Manifest: `datetime-field.plugin.ts` — `tina:field:datetime`, exported as
  `datetimeFieldPlugin`.
- Registration: `plugins/fields/index.ts` adds it to `corePlugins` and exposes
  `t.datetime`.

## Tests

`datetime-field.test.tsx` covers rendering a stored ISO datetime clipped to
what the input accepts, rendering a date-only value as midnight, rendering
empty when the value is absent, writing a picked value back through the form
store, accepting an ISO datetime and a plain date, accepting a `Date`
instance, rejecting a non-date string, accepting an absent value as optional,
rejecting an absent value when `required` is true, and ingest/digest
round-trips of an unedited stored value (a full ISO string, a date-only
string, and a `Date` instance).
