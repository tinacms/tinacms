# `@tinacms/tinacms` (v4) — architecture

How a collection schema and its plugins become an editing form, and how edits are
written back. For what a plugin is, see [plugins.md](./plugins.md).

The flow: **schema + plugins → registry → form → `<Field>` → component ⇄ hooks →
validate → digest**.

## 1. Resolve plugins into a registry

`<TinaProvider plugins={[…]}>` (`editor/provider.tsx`) calls `resolveFieldPlugins`
(`core/field/registry.ts`): it awaits each manifest's `client()` import and builds
the `FieldRegistry`, a `Map<type, FieldDescriptor>`. Two plugins at the same
`type` throw unless one declares `overrides`. The registry rides down through
`RegistryContext`.

## 2. Seed a form from the document

`<FormProvider collection document>` builds the form:

- `ingestDocument(document, fields, registry)` (`core/form/ingest.ts`) produces
  react-hook-form's `defaultValues` — per field, the descriptor's `parse(stored)`,
  or its `defaultValue` when the key is absent.
- `buildFormResolver(collection, registry)` (`editor/resolver.ts`) is the RHF
  resolver.
- `useForm({ defaultValues, resolver, mode: 'onChange' })` holds the values;
  switching documents re-seeds via `reset`.

The collection schema and active-field state ride down through context alongside
RHF's own `FormProvider`.

## 3. Render a field

`<Field address="title" />` (`editor/field.tsx`) finds the schema node by `name`,
reads its `type`, pulls the `descriptor` from the registry, and renders
`descriptor.Component` inside a `FieldAddressContext` carrying the address. The
component takes no props.

## 4. Read & write through hooks

The component pulls everything from address-keyed hooks (`editor/hooks.ts`):

| Hook | Backed by |
|---|---|
| `useFieldAddress()` | `FieldAddressContext` |
| `useFieldValue(address)` | RHF `useController` → `[value, setValue]` |
| `useFieldErrors(address)` | RHF `useFormState`, keyed by field name |
| `useFieldActivation(handler)` | fires when the active field equals this address |

Each field is its own RHF subscription, so a keystroke re-renders only that field.

## 5. Validate

On change, RHF runs the resolver, which calls `validateField(node, descriptor,
value)` (`core/validation.ts`) per field: the descriptor's Zod `schema(node)` plus
its optional `validate(value)`, concatenated. Messages are keyed by field name and
surface through `useFieldErrors`.

## 6. Digest on save

`digestDocument(values, fields, registry)` (`core/form/ingest.ts`) reverses
ingest — per field the descriptor's `serialize(value)`, or identity. `undefined`
values are dropped; `null` is preserved.

## Form status

Field values render through react-hook-form. Whether a form is clean, dirty, or
pristine is held by the form-state store (`form/form-store.ts`), exposed read-only
through `useFormStatus` / `useIsFormDirty` / `useIsFieldDirty`.
