# The `rich-text` field

A shipped field plugin: a `block`-layout markdown editor whose **stored value and
editor value are both the raw markdown source**. With `isBody: true` it owns the
file's markdown body instead of a frontmatter key. Source:
`plugins/fields/rich-text/`.

## Authoring

`t.richText({...})` stamps `type: 'rich-text'` (`RICH_TEXT_FIELD_TYPE`) onto the
config:

```ts
import { t } from '@tinacms/tinacms';

const collection = {
  name: 'post',
  format: 'mdx',
  fields: [
    t.string({ name: 'title', required: true }),
    t.richText({ name: 'body', label: 'Body', isBody: true }),
  ],
};
```

Config (`RichTextFieldSchema`, extends `BaseFieldSchema`):

| Key | Type | Effect |
|---|---|---|
| `name` | `string` (required) | field key in the document; also the fallback label |
| `label` | `string` | display label; used in validation messages |
| `required` | `boolean` | empty value fails validation |
| `isBody` | `boolean` | this field is the file's markdown body, not frontmatter |

## `isBody` — where the value comes from

At most one field per collection may set `isBody`; the local data layer asserts
that (`content-multiple-body-fields`) because a file has one body.

The format adapters (`plugins/content/local/format-adapters.ts`) do the routing.
`markdownAdapter` hands the body over as that field's value on read and writes it
straight back on save, so `md` and `mdx` behave identically. `json` has no body
concept and ignores the field name.

The body crosses **verbatim** — gray-matter's leading newline included — so a
save that doesn't edit it rewrites the file byte-identically. A save that omits
the field entirely (a partial update) leaves the existing body alone.

Without `isBody` the field is an ordinary frontmatter key that happens to hold
markdown.

## Two shapes, two consumers

The form edits the body as a markdown **string**. The local GraphQL pipeline
(`graphql-pipeline.ts`) serves the same body to the website render path as the v3
**mdx AST**, exactly as v3 did. Both read one file; neither converts for the
other.

## Descriptor

The client segment (`rich-text-field.client.tsx`) claims the `rich-text` key:

```tsx
defineClientPlugin({
  field: {
    type: 'rich-text',           // RICH_TEXT_FIELD_TYPE
    Component: RichTextField,
    defaultValue: '',
    metadata: { layout: 'block' },
    schema: richTextSchema,
    // no parse/serialize — editor value and stored value are the same string
  },
});
```

`layout: 'block'` tells a composite parent to render the field as its own
section rather than in line with single-line inputs.

## Validation

`richTextSchema(node)` is the string field's rules minus `min`/`max`/`pattern` —
those count characters, which says nothing useful about prose:

| Config | Rule | Message |
|---|---|---|
| `required` | empty (`''`/absent) fails | `<label> is required` |
| — | optional empty passes as `.optional()` | — |

Structural rules (required blocks, allowed embed templates) need the AST and
arrive with the WYSIWYG editor. Runs through the shared path (`validateField`);
see [`field-plugins.md`](./field-plugins.md#validation--two-layers).

## Component

`RichTextField` (`rich-text-field.ui.tsx`) takes **no props** — it reads
value/errors through address-keyed hooks:

```tsx
export function RichTextField() {
  const address = useFieldAddress();
  const [value, setValue] = useFieldValue<string>(address);
  const errors = useFieldErrors(address);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useFieldActivation(() => textareaRef.current?.focus());

  return (
    <FieldWrapper errors={errors}>
      <Textarea ref={textareaRef} aria-label={address} value={value ?? ''}
        onChange={(e) => setValue(e.target.value)} />
    </FieldWrapper>
  );
}
```

A WYSIWYG editor replaces this component and adds a `parse`/`serialize` pair
(markdown ↔ AST) beside it. Nothing outside `plugins/fields/rich-text/` moves —
the format adapters keep handing over a string either way.

## Where it's wired

- Manifest: `rich-text-field.plugin.ts` — `tina:field:rich-text`, exported as
  `richTextFieldPlugin`.
- Registration: `plugins/fields/index.ts` adds it to `corePlugins` and exposes
  `t.richText`.
- Body routing: `markdown.adapter.ts` + `local-data-layer.ts` (`bodyField`).

## Tests

`rich-text-field.test.tsx` covers verbatim rendering of stored markdown, the
empty default, edits through the form store, `required` on empty, optional empty,
a byte-exact ingest/digest round-trip, and the registered descriptor metadata.
`format-adapters.test.ts` and `local-data-layer.test.ts` cover the body routing:
parse under the body field, edited body written as markdown not frontmatter, the
byte-identical no-op rewrite, and an omitted body field leaving the file's body
untouched.
