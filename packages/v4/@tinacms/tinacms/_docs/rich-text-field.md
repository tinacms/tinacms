# The `rich-text` field

The `rich-text` field is one of the field plugins that v4 supplies. It is the
Plate editor from v3, and an author sees the formatted text during the edit. The
document stores markdown, and the editor holds the MDX abstract syntax tree
(AST). `@tinacms/mdx` converts between the two formats. It is the same parser as
v3, thus v3 content opens without a change. With `isBody: true`, the field
controls the markdown body of the file, and not a frontmatter key. The source
code is in `plugins/fields/rich-text/`.

## Authoring

`t.richText({...})` adds `type: 'rich-text'` (`RICH_TEXT_FIELD_TYPE`) to the
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

The config (`RichTextFieldSchema`, which extends `BaseFieldSchema`):

| Key | Type | Effect |
|---|---|---|
| `name` | `string` (necessary) | The field key in the document. It is also the alternative label. |
| `label` | `string` | The label on the screen. The validation messages use it. |
| `required` | `boolean` | An empty body does not pass validation. |
| `isBody` | `boolean` | This field is the markdown body of the file, and not a frontmatter key. |
| `templates` | `MdxTemplate[]` | The MDX components that an author can embed in the text. |
| `overrides` | `ToolbarOverrides` | The toolbar buttons and the heading levels that the editor shows. |

v3 also took a bare list of buttons under `toolbarOverride`. v4 drops it:
`overrides.toolbar` takes the same list, and it is the only shape the editor
reads. A v3 schema with `toolbarOverride: ['bold', 'italic']` becomes
`overrides: { toolbar: ['bold', 'italic'] }`.

There is no `parser` option. Both of v3's values lose content through this
field. `slatejson` makes `serializeMDX` return the AST, and this field writes
that as an empty body. `markdown` uses a stringifier that has no
`invalid_markdown` branch, so a body that did not parse saves as blank. The
unset value — the only value — takes the path that both round-trips markdown
and returns the original source for a body it could not parse. Add the option
again, behind tests, if a real collection needs it.

## The codec: what the file holds, and what the editor edits

The editor and the storage format are separate. A **codec** owns the format
entirely — how a body is read from the file and how it is written back — and the
editor knows nothing about markdown. Replace the codec and you replace the
format; nothing else in the field changes.

The contract is `rich-text-codec.ts`. It imports `FieldSchema` from the core
schema types, and it re-exports three symbols from `@tinacms/rich-text` —
`EMPTY_RICH_TEXT`, `RichTextNode`, and `RichTextValue` — but it depends on no
markdown parser. Implementing a codec does not drag the default one's parser
in behind it:

```ts
export interface RichTextCodec {
  parse(source: string, node: FieldSchema): RichTextValue;
  serialize(value: RichTextValue, node: FieldSchema): string;
}
```

`RichTextValue` is the one thing both sides must agree on: it is the **editor's**
document model, not any one format's AST. `serialize` always returns a string,
because that string is what lands in the file.

`node` is the field's own schema. The default codec reads `templates` off it to
resolve embeds — without them `<Callout />` degrades to a raw `html` node instead
of an element with props, which is the whole reason `descriptor.parse` and
`descriptor.serialize` take a second argument at all. A field whose conversion
uses only the value, like `number`, ignores it.

### Choosing a codec

The default is `mdxCodec` (`mdx.codec.ts`), markdown/MDX through `@tinacms/mdx` —
the same parser v3 used, so a v3 content folder opens unchanged. A field can
override it:

```ts
t.richText({ name: 'body', isBody: true, codec: myCodec })
```

`codecFor(node)` resolves it, and lives beside the default rather than beside the
contract, so the contract stays implementation-free and the universal entry
(`src/index.ts` reaches the schema) never pulls a parser into the main bundle.
A project-wide default belongs on `defineConfig` (ADR-024) when that lands.

One honest limit: because `codecFor` holds the default, overriding a field's codec
does not currently drop `@tinacms/mdx` from the bundle. That is a bundling
concern, not a correctness one, and the editor chunk dwarfs it either way.

`rich-text-codec.test.ts` drives the whole field with a codec that stores
upper-cased plain text — deliberately nothing like markdown, so it fails if any
markdown assumption leaks out of the codec.

### The separator line

gray-matter adds the body to the closing `---\n` line directly. Thus the empty
line between the frontmatter and the prose is a `\n` character at the start of
the body string. The AST has no concept of leading space characters, thus
`serializeMDX` removes that character. Without a correction, the CMS would
change the format of each v3 document at the first save.

`markdown.adapter.ts` writes the character again at serialization. Thus a save
with no changes writes the same bytes to the file.
`rich-text-field.test.tsx` tests this behavior.

## `isBody` and the source of the value

One field in a collection can set `isBody`, and no more than one. The local data
layer makes this check (`content-multiple-body-fields`), because a file has one
body.

`markdownAdapter` gives the body to that field as its value at read, and it
writes the body again at save. Thus `md` files and `mdx` files operate in the
same way. A `json` file has no body, thus the adapter ignores the field name. If
a save does not include the field, the body does not change.

The form edits the body as the MDX AST. The local GraphQL pipeline
(`graphql-pipeline.ts`) gives the same body to the website in the v3 MDX AST
format. Thus one file has one shape and two consumers.

## Render the value

`<TinaMarkdown>` (`src/rich-text/`) renders the AST to React.
`@tinacms/tinacms/adapters/react` exports it. It comes from v3 without a change,
thus the `components` map of a site continues to operate:

```tsx
import { TinaMarkdown } from '@tinacms/tinacms/adapters/react';

<TinaMarkdown content={post.body} components={{ MyEmbed: ({ ... }) => ... }} />
```

## Validation

| Config | Rule | Message |
|---|---|---|
| — | The value must be an AST with the shape `{ type: 'root', children }` | `<label> must be rich text` |
| — | The first child must not be `invalid_markdown` | `Unable to parse rich-text` |
| `required` | The value must have children | `<label> is required` |

If `@tinacms/mdx` cannot parse the markdown, it does not throw an error. It
gives one `invalid_markdown` node, so the editor can still show the source text.

This validation reports; it does not protect. A save does not run the resolver —
`useFormSave` digests the values and calls `onSave` directly — so the value
reaches the disk whether or not it passes. What keeps that safe is the
serializer: for an `invalid_markdown` node it writes the original source back,
not a blank body. `rich-text-field.test.tsx` covers that round trip.

## Embeds

An MDX component that an author can insert is a `templates` entry. The parser
needs that list to build the element: with the template, `<Callout text="hi" />`
becomes an `mdxJsxFlowElement` that carries `props`; without it, the same source
becomes a raw `html` node. The list reaches the parser through the `node`
argument of `parse`, and it reaches the embed components through
`EditorContext`, which `rich-text-field.ui.tsx` provides.

Editing the props of an embed needs the object field, which does not exist yet
(see the next section). The embeds parse, render, and serialize now, so an
embed's props survive an open-and-save.

The markdown codec itself does not yet preserve every detail through an
open-and-save with no edits. It rewrites GFM task-list checkboxes — `- [ ] a`
becomes `* a` — and it normalizes CRLF line endings to LF. Both are known
limits of the current codec, not of the embed handling above.

## The parts that the port does not include

The editor is the editor of v3, file for file (86 files in `plate/`). Four
parts are stubs, because v4 does not have the necessary capabilities now:

| Stub | It waits for | Effect now |
|---|---|---|
| `nested-form.tsx` | The object field (`plugins/fields/object/`) | The CMS parses, renders, and serializes the embeds. Their side panel is not available, thus a document loses no data when a user opens it. |
| `image-toolbar-button.tsx` | The media capability (`plugins/media/`) | The CMS renders and serializes the image nodes that exist. A user cannot insert a new image. |
| The field definitions of `create-img-plugin` | The image field | An author edits the URL of an embed as a plain string. |
| Raw mode | A raw markdown editor | v4 has no editor to switch to, so the toolbar button and the button on the parse-error card are hidden instead of dead. `EditorContext` keeps the `setRawMode` shape for when one exists. |

v3 selected a widget for each field with `component`. v4 finds the widget from
`type` in the field registry (ADR-009). For this reason, those field definitions
have a different shape.

The toolbar components use Radix, ariakit, and headlessui, and they do not use
base-ui from v4. A change of approximately 53 `plate-ui` components to base-ui
is a separate task. The team keeps it separate from the changes to the form
layer.

## Bundle

The editor is approximately 3.6 MB after minification. The dynamic `client()`
import of the plugin keeps the editor out of the main bundle. In the playground
build, the editor is a separate chunk, and the entry chunk is 314 kB. The split
of `.plugin.ts` and `.client.tsx` exists for this condition. `mermaid` is a
large part of the weight of the editor. The team can remove `mermaid`, or load
it only when a user needs it.

## The connections

- The manifest is `rich-text-field.plugin.ts`. Its name is
  `tina:field:rich-text`, and it exports `richTextFieldPlugin`.
- The registration is in `plugins/fields/index.ts`. That file adds the plugin to
  `corePlugins`, and it supplies `t.richText`.
- The body routing is in `markdown.adapter.ts` and `local-data-layer.ts`
  (`bodyField`).
- The renderer is in `src/rich-text/`. `adapters/react` exports it.

## A note about `@types/react`

The root of the repository supplies `@types/react` version 18, because v3 is a
React 18 package. Some dependencies, for example Plate and Radix, have types for
React 19. A compilation with those dependencies finds two React type identities.
Then each `forwardRef` component fails the `ElementType` check, and the
compilation gives approximately 94 errors. To prevent this, `tsconfig.json`
points `react` and `react-dom` to the types in this package.

## Tests

`rich-text-field.test.tsx` does these tests:

- It converts markdown to the AST with ingest, then converts the AST to markdown
  with digest.
- It makes sure that a save with no changes writes the same bytes through the
  format adapter.
- It makes sure that the separator line is correct after an edit to the body.
- It makes sure that an empty body gets the default value.
- It applies the `required` rule to an empty body.
- It rejects an `invalid_markdown` node.
- It rejects a value that is not an AST.
- It examines the metadata of the descriptor in the registry.

`format-adapters.test.ts` and `local-data-layer.test.ts` test the body routing.
