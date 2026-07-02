# The `boolean` field

One of the field plugins v4 ships: a single checkbox backed by a Zod type guard.

## Files

All four live in `plugins/fields/boolean/`:

| File | Role |
|---|---|
| `boolean-field.schema.ts` | the `t.boolean()` helper + the `booleanSchema` guard |
| `boolean-field.client.tsx` | the descriptor — claims the `boolean` key |
| `boolean-field.ui.tsx` | the `BooleanField` checkbox component |
| `boolean-field.plugin.ts` | the manifest — `tina:field:boolean` |

## Authoring

`t.boolean({...})` stamps `type: 'boolean'` (`BOOLEAN_FIELD_TYPE`) onto the config:

```ts
import { t } from '@tinacms/tinacms';

const collection = {
  name: 'post',
  fields: [t.boolean({ name: 'featured', label: 'Featured' })],
};
```

`BooleanFieldSchema` extends `BaseFieldSchema` — `name` (field key + fallback
label), `label`, and `required`. There's no `min`/`max`/`pattern`; a boolean has
nothing to constrain. `required` is accepted but a **no-op** (see below).

## Descriptor

The client segment (`boolean-field.client.tsx`) claims the `boolean` key:

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

No `validate`/`parse`/`serialize`: the value is stored as-is (a JSON/YAML boolean).

## Two-state model — why `required` is a no-op

A boolean is `true` or `false`; `false` is a first-class value, never "empty". The
checkbox can't show an "unanswered" state, so the field is seeded to
`defaultValue: false` and always renders a definite value. That leaves `required`
nothing coherent to enforce — rejecting `false` would mean "must be checked"
(conflating a deliberate "no" with empty), and rejecting an unset value would force
a check-then-uncheck to produce `false`. So `required?` is accepted (inherited from
`BaseFieldSchema`) but adds no rule. The legacy toggle field failed on
`undefined`/`null` and had exactly that flaw; v4 doesn't reproduce it.

## Validation

`booleanSchema` is a type guard, not a constraint set — it ignores the node and
only ensures a stored value is a boolean:

```ts
export const booleanSchema = (_node: FieldSchema): ZodType =>
  z.preprocess((v) => (v == null ? undefined : v), z.boolean().optional());
```

`true`/`false` pass; `undefined`/`null` normalise to `undefined` and pass as
optional; a non-boolean (e.g. `'yes'`) fails the type check. This runs through the
shared path (`validateField`); a descriptor-level `validate(value)` can still add
custom rules on top.

## Ingest & digest

On load, `ingestDocument` seeds `defaultValue` (`false`) for an absent field, so
the checkbox always starts with a value; a stored boolean is taken as-is (no
`parse`). From there the checkbox only ever produces `true` or `false`, so on save
`digestDocument` writes that boolean straight back — the field defines no
`parse`/`serialize`, so values pass through the shared ingest/digest unchanged.

## Component

`BooleanField` (`boolean-field.ui.tsx`) takes no props — it reads its address from
context and pulls value/errors through address-keyed hooks, so toggling it
re-renders only this field:

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

## Where it's wired

- Manifest: `boolean-field.plugin.ts` — `tina:field:boolean`, exported as
  `booleanFieldPlugin`.
- Registration: `plugins/fields/index.ts` adds it to `corePlugins` and exposes
  `t.boolean`.

## Tests

`boolean-field.test.tsx` covers rendering true/false/absent, toggling back through
the store, the `required` no-op (true and false both pass), the non-boolean
rejection, true/false ingest/digest round-trips (plus default seeding on absent),
and the descriptor metadata.
