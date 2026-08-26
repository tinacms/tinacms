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
  `parse(stored, node, context)` function of the descriptor. If the document
  does not contain that key, it uses `defaultValue`.
- `buildFormResolver(collection, registry)` (`editor/resolver.ts`) is the
  resolver for react-hook-form.
- `useForm({ defaultValues, resolver, mode: 'onChange' })` holds the values. If
  you open a different document, `reset` seeds the form again.

The context supplies the collection schema and the active-field state to the
components below it. React-hook-form supplies its own `FormProvider`.

## 3. Render a field

`<Field address="title" />` (`editor/field.tsx`) finds the schema node with the
`name` property, then it renders `<FieldNode address node>` with that node.
`<FieldNode>` gets the `descriptor` from the registry, then it renders
`descriptor.Component` in two contexts. `FieldAddressContext` contains the
address. `FieldSchemaContext` contains the resolved node. The component has no
props.

A compound field, such as `array`, does not read its item nodes from the
collection schema. It reads them from its own config (`ArrayFieldSchema.fields`),
and it renders `<FieldNode>` directly, with a nested address such as
`items.0.title`. Thus an item field renders through the same descriptor
resolution as a top-level field. Refer to
[`array-field.md`](./array-field.md#the-component).

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

A compound field also gets a call to its optional `validateChildren(value, node,
registry)` function. That function runs `validateField` again, once for each
item field, with the registry it receives as its third argument. It returns
its messages keyed by the item field's own nested address, such as
`items.0.title`. The resolver merges these messages in beside the field's own.
Thus an item field gets its errors from `useFieldErrors` the same way a
top-level field does — see
[`array-field.md`](./array-field.md#validation).

## 6. Digest at save

`digestDocument(values, fields, registry)` (`core/form/ingest.ts`) does the
opposite operation to `ingestDocument`. For each field, it calls the
`serialize(value, node, context)` function of the descriptor. If the
descriptor has no `serialize` function, the value does not change. The
function removes the `undefined` values, but keeps the `null` values.

`context` (`FieldTransformContext`, `core/field/contract.ts`) carries the
registry alongside `documentPath`. A compound field's `parse`/`serialize`
reads `context.registry` to call `ingestDocument`/`digestDocument` again, once
for each item, with its own `fields` config. Thus it reuses the same
conversion path for its items as the top-level form uses for its fields.

## Form status

React-hook-form renders the field values. The form-state store
(`form/form-store.ts`) holds the status of the form: clean, dirty, or pristine.
The read-only hooks `useFormStatus`, `useIsFormDirty`, and `useIsFieldDirty`
give the status.
