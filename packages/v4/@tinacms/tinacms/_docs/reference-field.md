# The `reference` field

The `reference` field is one of the field plugins that v4 supplies. It points
one document at another document. The document stores the path of the document
it points at, and the editor shows a combobox of the documents an author can
choose.

The `select` field also picks one value, but it reads a fixed `options` list.
The `reference` field has no fixed list. It asks the content capability for the
documents of each collection it names, so its options come from the content at
the time an author opens the field.

## Files

The four files are in `plugins/fields/reference/`:

| File | Role |
|---|---|
| `reference-field.schema.ts` | The `t.reference()` helper function, and the `referenceSchema` validator |
| `reference-field.client.tsx` | The descriptor, which takes the `reference` key |
| `reference-field.ui.tsx` | The `ReferenceField` component |
| `reference-field.plugin.ts` | The manifest, `tina:field:reference` |

## Authoring

`t.reference({...})` adds `type: 'reference'` (`REFERENCE_FIELD_TYPE`) to the
config:

```ts
import { t } from '@tinacms/tinacms';

const collection = {
  name: 'post',
  fields: [
    t.reference({
      name: 'author',
      label: 'Author',
      required: true,
      collections: ['author'],
    }),
  ],
};
```

`ReferenceFieldSchema` extends `BaseFieldSchema`. It adds one property:

| Key | Type | Effect |
|---|---|---|
| `collections` | `string[]` (required) | the names of the collections an author can choose a document from |

`collections` holds collection **names**, not paths and not labels. A field can
name more than one collection. The field then shows the documents of every one
of them in a single list, and the author still chooses one document.

## The stored value

The document stores the path of the document it points at, as a plain string:

```yaml
---
title: Hello World
author: content/authors/ada.mdx
---
```

The value is one path. `collections` controls what an author can choose. It
does not make the value a list.

## The descriptor

The client segment (`reference-field.client.tsx`) takes the `reference` key:

```tsx
defineClientPlugin({
  field: {
    Component: ReferenceField,
    metadata: { layout: 'inline' },
    schema: referenceSchema,
    parse: (stored: string) => (stored == null ? undefined : stored),
    serialize: (value: string | null) => value ?? undefined,
  },
});
```

The descriptor has no `defaultValue`. An absent reference stays absent, because
the field does not pick a first document for the author.

`parse` and `serialize` convert between an absent value and a cleared value.
The editor writes `null` when an author clears the field, and `serialize` turns
that `null` into `undefined`, so a cleared reference leaves the document
instead of writing a literal `null` to it.

## Validation

`referenceSchema(node)` builds a `z.string()`. The stored value is a path, so
the validator checks that a path is present. It does not check that the path
resolves.

| Config | Rule | Message |
|---|---|---|
| `required` | the value is absent or empty | `<label> is required` |
| (none) | an absent or empty value passes | |

An optional field wraps the string in `z.preprocess`, so `''` and `null` become
`undefined` and pass. This runs through the shared path (`validateField`); see
[`field-plugins.md`](./field-plugins.md#validation-in-two-layers).

A reference whose document no longer exists is not a validation failure. Zod
sees only the stored string, and it cannot read the content. The component
reports that case instead; see [Missing references](#missing-references).

## Ingest and digest

`ingestDocument` and `digestDocument` pass the stored path through unchanged. A
document with no stored value stays absent after ingest, because the descriptor
sets no `defaultValue`. A cleared reference digests as absent, not as `null`.

## The component

`ReferenceField` (`reference-field.ui.tsx`) has no props. It reads its address
and its resolved schema node from the context, and it gets the value and the
errors from hooks that use the address.

### The options

A field can name more than one collection, and the rules of hooks do not permit
a call to `useCollectionDocuments` for each name in a loop. The component uses
`useQueries` instead, which takes the whole set in one call:

```tsx
const useReferenceOptions = (collections: string[]): ReferenceOptions => {
  const content = useContentSlice();
  return useQueries({
    queries: collections.map((collection) => ({
      queryKey: contentKeys.list(collection),
      queryFn: () => content.list(collection),
      staleTime: CONTENT_STALE_TIME,
    })),
    combine: (results) => ({
      options: results.flatMap(
        (result) =>
          result.data?.map((summary) => ({
            value: summary.path,
            label: summary.path,
          })) ?? []
      ),
      isLoading: results.some((result) => result.isLoading),
      error: results.find((result) => result.error)?.error ?? null,
    }),
  });
};
```

The queries use the same keys as `useCollectionDocuments`
(`contentKeys.list(collection)`), so the field and the rest of the editor share
one cache.

`content.list` returns a `DocumentSummary`, which holds a path and no content.
Each option therefore shows its path. See
[`core/content/contract.ts`](../src/core/content/contract.ts) for why `list`
carries no bodies.

### Search and clear

The field renders a combobox, not a select. A collection can hold more
documents than a list can show, so an author types to narrow the options. The
field shows "No documents match." when nothing does.

An optional field shows a clear button. A required field does not.

### Missing references

A stored path whose document is gone stays in the list, with `(missing)` after
it. The field does not drop the value, and it does not silently show an empty
control. An author sees what the reference points at, and can choose another
document.

### A failed lookup

When `content.list` fails, the field disables the input and reports the message
through `FieldWrapper`. Before this, the field showed an empty list and gave no
reason for it.

## In the preview

The form holds a reference as a path. A site renders the document that the path
points at. `usePreviewConnection` closes that gap: it swaps each reference path
for the document it names before it posts the values to the preview, so the
site reads the same shape whether it renders statically or through the editor.

The walk is in [`core/form/references.ts`](../src/core/form/references.ts).
`collectReferences` names the documents to fetch, and `resolveReferences`
substitutes the documents that the content cache already holds. The post stays
synchronous, so a keystroke never waits on the network. A reference that has
not arrived yet keeps its path for a frame.

## The connections

- The manifest is `reference-field.plugin.ts`. Its name is
  `tina:field:reference`, and it exports `referenceFieldPlugin`.
- The registration is in `plugins/fields/index.ts`. That file adds the plugin
  to `corePlugins`, and it supplies `t.reference`.
- `FieldSchema` carries `collections`, so the GraphQL pipeline and
  `references.ts` both read it from a bare schema node.

## Tests

`reference-field.test.tsx` does these tests:

- It shows the path of the referenced document, and the placeholder when the
  field is absent.
- It narrows the options to what an author types, and reports when nothing
  matches.
- It offers every document of each collection the field names, and it asks the
  content capability once for each name.
- It stores the path of the chosen document.
- It clears an optional reference, and it shows no clear button on a required
  one.
- It marks a stored path that no document answers, and keeps that path
  selectable.
- It rejects a missing value on a required field, and passes an empty value on
  an optional field.
- It passes a stored path through ingest and digest without a change, and
  digests a cleared reference as absent.
- It examines the metadata of the descriptor.

## Not in this field

A document cannot yet name the documents that reference it. That reverse query
needs an index in the content layer, not a change to this field, and it is
tracked separately.
