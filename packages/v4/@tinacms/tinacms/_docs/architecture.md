# `@tinacms/tinacms` (v4) — architecture

This document tells you how a collection schema and its plugins become an
editing form. It also tells you how TinaCMS writes the changes back to the
document. For a description of a plugin, refer to [plugins.md](./plugins.md).

The sequence is: schema and plugins → registry → form → `<Field>` → component ⇄
hooks → validation → digest.

## 1. Resolve the plugins into a registry

`<TinaAdmin config>` (`admin/admin.tsx`) mounts `<TinaProvider>` itself, so an
app renders one component and does not compose the provider by hand.
`<TinaProvider plugins={[...]}>` (`editor/provider.tsx`) calls
`resolveFieldPlugins` (`core/field/registry.ts`). `resolveFieldPlugins` awaits
the `client()` import of each manifest. Then it builds the `FieldRegistry`, a
`Map<type, FieldDescriptor>`. If two plugins have the same `type`, the function
throws an error. To prevent the error, one plugin must declare `overrides`.
`RegistryContext` supplies the registry to the components below it.

## 2. Seed a form from the document

`<FormProvider collection document>` builds the form:

- `ingestDocument(document, fields, registry)` (`core/form/ingest.ts`) makes the
  `defaultValues` object for react-hook-form. For each field, it calls the
  `parse(stored)` function of the descriptor. If the document does not contain
  that key, it uses `defaultValue`.
- `buildFormResolver(collection, registry)` (`editor/resolver.ts`) is the
  resolver for react-hook-form.
- `useForm({ defaultValues, resolver, mode: 'onChange' })` holds the values. If
  you open a different document, `reset` seeds the form again.

The context supplies the collection schema and the active-field state to the
components below it. React-hook-form supplies its own `FormProvider`.

## 3. Render a field

`<Field address="title" />` (`editor/field.tsx`) finds the schema node with the
`name` property. It reads the `type` of that node, then it gets the `descriptor`
from the registry. Then it renders `descriptor.Component` in two contexts.
`FieldAddressContext` contains the address. `FieldSchemaContext` contains the
resolved node. The component has no props.

## 4. Read the value and write the value with hooks

The component gets all its data from hooks that use the address
(`editor/hooks.ts`):

| Hook | Source |
|---|---|
| `useFieldAddress()` | `FieldAddressContext` |
| `useFieldSchema()` | `FieldSchemaContext`, which holds the resolved node of the field |
| `useFieldValue(address)` | `useController` from react-hook-form, which gives `[value, setValue]` |
| `useFieldErrors(address)` | `useFormState` from react-hook-form, with the field name as the key |
| `useFieldActivation(handler)` | Operates when the address of the active field is the same as this address |

Each field has its own react-hook-form subscription. Thus a keystroke renders
that field again, but does not render the other fields again.

## 5. Validate

At each change, react-hook-form runs the resolver. For each field, the resolver
calls `validateField(node, descriptor, value)` (`core/validation.ts`). That
function runs the Zod schema of the descriptor, `schema(node)`. Then it runs the
optional `validate(value)` function of the descriptor. It joins the two sets of
messages. The field name is the key of each message. `useFieldErrors` gives the
messages to the component.

## 6. Digest at save

`digestDocument(values, fields, registry)` (`core/form/ingest.ts`) does the
opposite operation to `ingestDocument`. For each field, it calls the
`serialize(value)` function of the descriptor. If the descriptor has no
`serialize` function, the value does not change. The function removes the
`undefined` values, but keeps the `null` values.

## Form status

React-hook-form renders the field values. The form-state store
(`form/form-store.ts`) holds the status of the form: clean, dirty, or pristine.
The read-only hooks `useFormStatus`, `useIsFormDirty`, and `useIsFieldDirty`
give the status.
