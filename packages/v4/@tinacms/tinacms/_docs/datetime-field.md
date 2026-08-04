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

## What a `datetime` value means

A `datetime` value is an **instant** — one point in time. `parse` shows this:
it makes a `Date` into `toISOString()`, which carries a zone.

The stored string says whether it carries a zone, and the field obeys it:

| Stored form | Example | Meaning |
|---|---|---|
| Zone-qualified | `2024-05-01T09:30:00.000Z`, `2024-05-01T09:30+10:00` | an instant |
| No zone | `2024-05-01T09:30` | the wall clock it spells |
| Date only | `2024-05-01` | that date at midnight |

The field never changes whether a value carries a zone. A zone-qualified value
goes back as UTC, so a touch cannot move the instant. A value with no zone
stays without one, because the field cannot know which zone another writer
meant. A new value gets UTC.

## Why there is no `defaultValue` and no `serialize`

- **`defaultValue`** — `datetime` follows the same rule as `number`: an absent
  field stays absent. `ingestDocument` seeds a field only when the descriptor
  sets `defaultValue` (`core/form/ingest.ts`); `datetime` opts out, so a
  document with no stored date shows an empty input instead of a fabricated
  one. This matches an established pattern, so it reads as deliberate.

- **`serialize`** — The editor value and the stored value use one
  representation: an ISO 8601 string. `digestDocument` writes the editor value
  unchanged when `serialize` is absent (`core/form/ingest.ts`), and that value
  is already the stored form. `parse` exists only to make the `Date` that YAML
  frontmatter gives into that string. This is unlike `number`, which needs
  `serialize` because its editor value is a string and its stored value is a
  number.

  The component does the zone work, not `serialize`: `fromInputValue` puts the
  wall clock from the input back into the form of the stored value.

## Validation

`datetimeSchema(node)` (`datetime-field.schema.ts`) preprocesses the value,
then validates the result:

1. A `Date` instance becomes its ISO string (`value.toISOString()`).
2. `''`, `null`, and `undefined` become `undefined`.
3. Anything else passes through unchanged.

| Config | Rule | Message |
|---|---|---|
| — | The value must be a string | `<label> must be a date string` |
| — | The string must be an ISO 8601 date or date-time, and it must parse with `Date.parse` | `<label> must be a valid date` |
| `required` | An empty value (after step 2) fails the string check | `<label> is required` |
| — | An optional empty value passes as `.optional()` | — |

The shape rule keeps the schema and the component in agreement. `Date.parse`
takes more shapes than ISO 8601 — `May 1, 2024` for one — and the input cannot
show them.

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
        value={toInputValue(value)}
        onChange={(event) => setValue(fromInputValue(event.target.value, value))}
      />
    </FieldWrapper>
  );
}
```

`toInputValue` makes a stored value into what `datetime-local` accepts
(`YYYY-MM-DDTHH:mm`). A zone-qualified value becomes the local wall clock of
that instant. A value with no zone keeps its first 16 characters. A date-only
string becomes midnight of that date.

`fromInputValue` does the opposite, and it keeps the form of the stored value.
Refer to "What a `datetime` value means" above.

The input has minute granularity, so a stored value that carries seconds or
milliseconds loses them on edit. The field writes the precision the editor can
see.

Unlike `string`, `boolean`, and `number`, `DatetimeField` renders through the
shared `@tinacms/ui` `FieldWrapper`/`Input` components instead of a bare
`<div>`/`<input>` pair.

## Where it's wired

- Manifest: `datetime-field.plugin.ts` — `tina:field:datetime`, exported as
  `datetimeFieldPlugin`.
- Registration: `plugins/fields/index.ts` adds it to `corePlugins` and exposes
  `t.datetime`.

## Tests

`datetime-field.test.tsx` covers rendering a stored instant as the local wall
clock, rendering a value with no zone as the wall clock it spells, rendering a
date-only value as midnight, rendering empty when the value is absent, writing
a picked value back through the form store, accepting an ISO datetime and a
plain date, accepting a `Date` instance, rejecting a non-date string, accepting
an absent value as optional, rejecting an absent value when `required` is true,
and ingest/digest round-trips of an unedited stored value (a full ISO string, a
date-only string, and a `Date` instance).

Three tests hold the zone contract:

- **keeps the instant when an editor opens the field and touches it** — the
  load-bearing one. Run it with a non-zero `TZ`. A zone with no offset hides
  the fault: `TZ=UTC` passes it even with no zone math.
- **keeps the value zone-qualified when an editor touches it** — catches the
  stored form dropping its zone. This one fails in every zone.
- **leaves a stored value with no zone without one** — catches the field giving
  a zone to a value that another writer made.

Run the file with at least `TZ=UTC` and one zone with an offset, for example
`TZ=Australia/Sydney`.
