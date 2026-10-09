# The `image` field

The `image` field is one of the field plugins that v4 supplies. It attaches one
image to a document. The document stores the media path of the image, and the
editor shows a preview, a picker and an upload control.

The field needs a media plugin. Its manifest declares `dependsOn: ['media']`,
and `defineConfig` installs it only when a plugin provides the `media`
capability. A schema that uses `t.image` without a media plugin fails in
`defineConfig` with a message that names the missing plugin.

## Files

The four files are in `plugins/fields/image/`:

| File | Role |
|---|---|
| `image-field.schema.ts` | The `t.image()` helper function, and the `imageSchema` validator |
| `image-field.client.tsx` | The descriptor, which takes the `image` key |
| `image-field.ui.tsx` | The `ImageField` component |
| `image-field.plugin.ts` | The manifest, `tina:field:image` |

## Authoring

`t.image({...})` adds `type: 'image'` (`IMAGE_FIELD_TYPE`) to the config:

```ts
import {
  defineConfig,
  localContentPlugin,
  localMediaPlugin,
  required,
  t,
} from '@tinacms/tinacms';

export default defineConfig({
  plugins: [localContentPlugin(), localMediaPlugin()],
  schema: {
    collections: [
      {
        name: 'post',
        fields: [
          t.image({ name: 'hero', label: 'Hero image' }),
          t.image({ name: 'cover', validators: [required()] }),
        ],
      },
    ],
  },
});
```

`ImageFieldSchema` extends `BaseFieldSchema`, and it adds no properties.

> `required` is not a config key. It is a validator that a core plugin
> registers, and a collection attaches it with `validators`. Refer to
> [Validation in two layers](./field-plugins.md#validation-in-two-layers).

The v3 keys `uploadDir`, `previewSrc`, `parse` and `format` are functions.
A function cannot go in `tina-lock.json`, so the v4 field does not have them.

## The stored value

The document stores the media path of the image, relative to the media root
(ADR-022). It does not store a URL:

```yaml
---
title: Hello World
hero: posts/hero.jpg
---
```

The media plugin turns the path into a URL. A change of media plugin does not
change the content. v3 content stores a URL such as `/uploads/posts/hero.jpg`,
and v4 does not migrate it yet.

## The descriptor

The client segment (`image-field.client.tsx`) takes the `image` key:

```tsx
defineClientPlugin({
  field: {
    Component: ImageField,
    metadata: { layout: 'inline', labelable: false },
    schema: imageSchema,
    parse: (stored: string) => (stored == null ? undefined : stored),
    serialize: (value: string | null) => value ?? undefined,
  },
});
```

The descriptor has no `defaultValue`. An absent image stays absent.

The editor writes `null` when an author clears the field. `serialize` turns
that `null` into `undefined`, so a cleared image leaves the document.

`labelable: false` is necessary because the field has no single input. The
widget is a `group` that reads the label of its row through `aria-labelledby`,
and each button keeps its own name.

## Validation

`imageSchema(node)` builds a `z.string()`. It checks that the value is a path.
It does not check that the file exists.

| Config | Rule | Message |
|---|---|---|
| (none) | an absent or empty value passes | |
| (none) | a value that is not a string fails | the Zod message |

The string goes through `z.preprocess`, so `''` and `null` become `undefined`
and pass. A `required()` validator then rejects an absent value.

## Ingest and digest

`ingestDocument` and `digestDocument` pass the stored path through unchanged.
A cleared image digests as absent, not as `null`.

## The component

`ImageField` (`image-field.ui.tsx`) has no props. It reads its address and its
schema node from the context, and it reads the media provider with
`useMediaSlice`.

### Empty and filled

An empty field shows a drop zone hint above a "Choose image" button. A filled
field shows a thumbnail and the file name above a "Replace" button and a
"Clear" button. The buttons wrap in a narrow form column.

The thumbnail comes from `resolveUrl(path, { width: 400, height: 400 })`, on
the checkerboard background of the Media Manager. A provider without image
transforms ignores the size.

A required field shows no "Clear" button.

### Picking

"Choose image" and "Replace" open a dialog with
`<MediaBrowser mode='pick' accept='image' />`. When the author clicks
"Insert", the field stores `item.path` and closes the dialog. Refer to
[Pick mode](./media-manager.md#pick-mode).

### Uploading

An author drops a file on the field, or selects one with "Upload". The field
checks the file with `uploadRulesOf(extensionsForCategory('image'))` and the
`features.maxSize` of the provider. It then calls `media.upload(file)` and
stores the path that the provider returns.

During the upload, the buttons are disabled and the upload control shows
"Uploading…". A rejected file or a failed upload shows its message through
`FieldWrapper`. For a `MediaError`, the message is the sentence for the
author, not the technical `detail`.

When `features.readOnly` is set, the field shows no upload control and accepts
no drop. An author can still pick an existing image.

### Missing images

A just-uploaded file can return a 404 until the dev server or the CDN sees it,
and the browser caches that 404 for the URL. When the thumbnail does not load,
the field tries again after 500, 1000 and 2000 ms, each time with a new
`retry` query on the URL. After the last failure, the field shows
`path (missing)` in place of the file name. It keeps the stored value, so a missing file does not silently
empty the field. The author can replace or clear it.

### Activation

`useFieldActivation` focuses the main button: "Choose image" when the field is
empty, "Replace" when it is filled.

## Rendering on the site

An image field stores a media path such as `posts/hero.jpg`, never a URL. The
site turns it into a URL with `resolveMediaUrl`, from `@tinacms/tinacms`:

```tsx
import { resolveMediaUrl } from '@tinacms/tinacms';
import config from '../tina/config';

{post.heroImage ? (
  <img src={resolveMediaUrl(config, post.heroImage, { width: 1200 })} alt='' />
) : null}
```

The same call works in static rendering and in the preview, because the
preview also sends the path. `localMediaPlugin()` gives
`/uploads/posts/hero.jpg` and ignores the size. `tinaCloud()` gives a CDN URL
with a crop. Refer to [media.md](./media.md#rendering-media-on-the-site).

## The connections

- The manifest is `image-field.plugin.ts`. Its name is `tina:field:image`, and
  it exports `imageFieldPlugin`.
- The registration is in `plugins/fields/index.ts`. That file adds the plugin
  to `corePlugins`, and it supplies `t.image`.
- The picker is `MediaBrowser` from `plugins/media-manager/`, and the dialog
  is the shadcn `dialog` in `@tinacms/ui`.
- On the site, `resolveMediaUrl` turns the stored path into a URL. Refer to
  [`media.md`](./media.md).

## Tests

`image-field.test.tsx` uses a stub media plugin, and does these tests:

- It previews a stored path through `resolveUrl`, and shows the empty state
  when the field is absent.
- It stores the path of a picked image, and replaces a stored image.
- It stores the path that an upload returns, rejects a file that is not an
  image, and shows the message of a failed upload.
- It shows no upload control when the provider is read-only.
- It clears an optional image, and shows no clear button on a required one.
- It retries an image that fails to load with a new URL, marks an image that
  never loads as missing, and keeps the value.
- It rejects a missing value on a required field, passes an empty value on an
  optional field, and rejects a value that is not a string.
- It passes a stored path through ingest and digest without a change, and
  digests a cleared image as absent.
- It examines the metadata of the descriptor and the `media` dependency.

`admin/field-labels.test.tsx` checks that the row label names the group.
