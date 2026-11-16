# The `image` field

The `image` field is one of the field plugins that v4 supplies. It attaches one
image to a document. The document stores the media path of the image, and the
editor shows a picture tile, a picker and a drop area.

The field needs a media plugin. Its manifest declares `dependsOn: ['media']`,
and `defineConfig` installs it only when a plugin provides the `media`
capability. A schema that uses `t.image` without a media plugin fails in
`defineConfig` with a message that names the missing plugin.

## Files

The files are in `plugins/fields/image/`:

| File | Role |
|---|---|
| `image-field.schema.ts` | The `t.image()` helper function, and the `imageSchema` validator |
| `image-field.client.tsx` | The descriptor, which takes the `image` key |
| `image-field.ui.tsx` | The `ImageField` container |
| `image-field.view.tsx` | The presentational view |
| `image-tile.tsx` | The tile of the single image, the cover and each gallery item |
| `image-gallery.view.tsx`, `image-gallery.ui.tsx` | The gallery view and its container |
| `image-preview.ts` | The preview URL with retry-then-missing |
| `image-upload.ts` | `useImageUpload`: the upload state of the field, read from the upload list |
| `image-field.states.ts` | Every look, for sign-off and tests |
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

`ImageFieldSchema` extends `BaseFieldSchema` and adds one property:

| Property | Type | Effect |
|---|---|---|
| `cover` | `'wide' \| 'tall'` | Shows the picture larger: `wide` is 16:9, `tall` is 4:3. The empty drop area keeps the same shape. Any other value fails schema validation. |

`cover` has no effect on the image of a list of images (`of: t.image(...)`).
Gallery tiles are always square. Other field types reject `cover` in the type
checker.

A list of images is a `t.array` whose `of` is an image field:

```ts
t.array({ name: 'gallery', label: 'Gallery', of: t.image({ name: 'image' }) })
```

> `required` is not a config key. It is a validator that a core plugin
> registers, and a collection attaches it with `validators`. Refer to
> [Validation in two layers](./field-plugins.md#validation-in-two-layers).

The v3 keys `uploadDir`, `previewSrc`, `parse` and `format` are functions.
A function cannot go in `tina-lock.json`, so the v4 field does not have them.

Every field also takes `description`, `defaultValue` and `hidden`. Refer to
[Options every field takes](./field-plugins.md#options-every-field-takes).

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
  },
});
```

The descriptor has no `defaultValue`. An absent image stays absent.

The editor writes `null` when an author clears the field. The digest leaves
out `null`, so a cleared image leaves the document.

`labelable: false` is necessary because the field has no single input. The
widget is a `group` that reads the label of its row through `aria-labelledby`,
and each button keeps its own name.

## Validation

`imageSchema(node)` builds a `z.string()`. It checks that the value is a media
path, relative to the media root (ADR-022). It does not check that the file
exists.

| Config | Rule | Message |
|---|---|---|
| (none) | an absent or empty value passes | |
| (none) | a value that is not a string, a URL, a path that starts with `/`, or a path with a `..` segment fails | `{label} must be a media path, like posts/hero.jpg` |

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

The view (`image-field.view.tsx`) takes props only. The container
(`image-field.ui.tsx`) reads the form and the media provider and feeds it.

An empty field shows a dashed drop area with a "Choose from Media" button. A
read-only empty field says "No image.". A filled field shows one tile
(`image-tile.tsx`): the picture, capped in width, with Replace and Remove icon
buttons on its top right corner at rest, and the file name small and muted
under it. The buttons are named "Replace {file}" and "Remove {file}", and each
shows that name in a tooltip. Remove writes an absent value at once, with no
confirm. Neither button deletes the media file.

The thumbnail comes from `resolveUrl(path, { width: 400, height: 400 })`. The
`<img>` stays hidden until it loads. A required field shows no Remove button.

`image-field.states.ts` lists every look (single, cover, gallery) for the
design sign-off and the render test.

### Picking

"Choose from Media" and "Replace" open a dialog with
`<MediaBrowser mode='pick' accept='image' />`. When the author clicks
"Insert", the field stores `item.path` and closes the dialog. A cancelled
Replace keeps the old value. Refer to
[Pick mode](./media-manager.md#pick-mode).

### Uploading

An author drops a file on the field. The field sends the first file of the
drop to the upload list of the admin, and the file goes to the media root.
The upload list is the same list that the Media pane and the picker use, so
the file also shows under the Upload button. Refer to
[Upload](./media-manager.md). The picker dialog has its own upload button.

The field reads its upload state from the upload list by form and by field
address (`useImageUpload` in `image-upload.ts`). It does not keep this state
in the component. A form level that closes and opens again shows the same
state.

The document's form writes the value when the file lands. The field does not
write it. The field fills when the author is in another field, or when the
form level is closed. The document then reads as edited. When the document
closes, or the author discards or resumes edits, before the file lands, the
form gets no value. The file is still in Media.

The drop states:

| State | What the field shows |
|---|---|
| Uploading | The picture area with a veil, a spinner and "Uploading 40%". The number is at most 99. A provider that reports no progress shows "Uploading". The field ignores a second drop. |
| Failed | The name of the file and the reason under the field as an error. A Retry button sits beside "Choose from Media". The field stays empty. |
| Failed, no Retry | A file that is not an image, a file over `features.maxSize`, an upload that the storage did not confirm and a missing permission show the name of the file and the reason, and no Retry. The field reads the type of a file from its extension when the media type table knows the extension, and from the type that the browser reports for any other extension. A file type that the storage does not accept also shows the reason and no Retry. |
| Name was taken | The field holds the numbered path. A muted note under the file name says "hero.jpg was taken, saved as hero-1.jpg". |

An error about a file starts with the name of that file: "hero.jpg: Couldn't
upload. Check your connection, then retry." For a `MediaError`, the reason is
the sentence for the author, not the technical `detail`.

Choose from Media, a new drop and Remove clear a failure.

The note goes when another image takes the field, when the field is cleared,
and when a new upload for the field starts. A new upload starts on a drop on
the empty field, and on Replace in the confirm. The note does not come back
when that upload fails or is cancelled.

When the branch changes, the field stops showing its upload. A file that was
sending bytes lands in Media on the branch it started on. No form gets a
value.

### Replacing by a drop

When an author drags a file over a field that has an image, the tile says
"Drop to replace". On the drop, a confirm asks "Replace hero.jpg?".

- Cancel keeps the value and sends nothing. Focus returns to the field.
- Replace uploads the file. The old image stays under the veil until the new
  file lands. Then the field takes the new path. A taken-name note about the
  old image goes at once.
- When the upload fails, the field keeps the old image. The name of the file
  that failed, the reason and Retry show under the field.

The field never deletes the old file from Media.

Focus stays in the confirm while it is open. The confirm, the picker dialog
and the Save to new branch dialog are portals, and React sends their focus
events through the row of the field. The first focus event activates the
field. The field does not take focus on that activation while focus is in a
dialog that the field is not in.

### When the field turns a drop away

The field refuses a drop and says why in words. It sends no request.

| Cause | Words |
|---|---|
| A save runs | "Saving. You can upload once it finishes." The drop area shows this for the length of the save. |
| The storage is read-only (`features.readOnly`) | "This storage is read-only. Files can't be uploaded here." |
| An upload was refused for this branch and this user | "You don't have permission to upload." |

The field shows the last two reasons only while a file is dragged over it, or
after a refused drop. An author can still choose, replace and remove.

A disabled or read-only field takes no drop. It shows no "Drop to replace"
and no Retry, and it still shows its value. An invalid field keeps its red
border while a file is dragged over it.

### Protected branch

On a protected branch, a drop opens the Save to new branch dialog, the same
dialog that the Media pane uses for an upload. The field sends nothing before
Continue. Cancel returns focus to the field.

The outcome of the branch step shows under the field as its error:

- "Couldn't make the branch. Try again." has a Retry button. Retry runs the
  branch step again.
- "Couldn't switch to the new branch. Nothing was uploaded." has no Retry.

When the switch to the new branch replaces the form of the document, the file
goes to Media and no form gets a value.

The field renders `<UploadHost />`. The host draws the dialog and one polite
status for the page. A form with no `TinaAdmin` above it has both, one time
only.

### Missing images

A just-uploaded file can return a 404 until the dev server or the CDN sees it,
and the browser caches that 404 for the URL. When the thumbnail does not load,
the field tries again after 500, 1000 and 2000 ms, each time with a new
`retry` query on the URL (`image-preview.ts`). After the last failure, the tile
turns muted and the wrapper shows an amber warning, not an error. The stored
value stays, so a missing file does not silently empty the field. The author
can replace or remove it, and the form still saves.

A hand-edited file can hold a value that is not a string, such as
`heroImage: 2024`. The field shows `Not a media path` and keeps the value
until the author replaces or removes it.

### The gallery

A list of images renders `ImageGallery` (`image-gallery.ui.tsx`, the image descriptor's `ListView`) in place of
the generic scalar list: square tiles three across and an "Add images" tile at
the end. It has one wrapper and one picker. "Add images" appends only after a
pick, and each pick adds one image. Remove splices the item out, so the saved
list has no `null` holes. The same image can appear twice.

A tile reorders by dragging it (a 4px threshold; Escape or releasing outside
the gallery cancels), or by arrow keys on its handle "Move Image N: {file}".
Focus stays on the moved tile, and a polite live region says "Moved {file} to
position N of M". The generic "Move item" and "Remove item" row buttons do not
apply to the gallery.

The gallery is the `ListView` of the image descriptor. The array field asks the
registry for `ListView` on `of.type`, so a site that overrides the stock `image`
plugin replaces the gallery too. An override without a `ListView` gets one
row per item.

### Activation

`useFieldActivation` focuses "Choose from Media" when the field is empty and
"Replace" when it is filled. On a gallery, activating `<address>.<i>` focuses
the Replace button of tile i.

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
- It shows no drop prompt when the provider is read-only.
- It clears an optional image, and shows no clear button on a required one.
- It retries an image that fails to load with a new URL, marks an image that
  never loads as missing, and keeps the value.
- It shows a stored value that is not a string as not a media path.
- It rejects a missing value on a required field, passes an empty value on an
  optional field, and rejects a URL, a path outside the media root, or a
  value that is not a string.
- It passes a stored path through ingest and digest without a change, and
  digests a cleared image as absent.
- It examines the metadata of the descriptor and the `media` dependency.

`image-field.uploads.test.tsx` runs the field in the real form provider with
a media stub whose uploads the test controls. It does these tests:

- It shows the progress, fills the field when the file lands, and refuses a
  file that is not an image or that is too large.
- It fills the field after the author moves to another field or closes the
  form level, and writes nothing after a close, a discard or a resume.
- It shows a failure with the name of the file and Retry, and clears it on a
  pick, a drop or a remove.
- It shows the taken-name note, and keeps it across a closed form level. The
  note goes when Replace is confirmed, and it does not come back.
- It asks before a drop replaces an image, and keeps the old image on Cancel
  and on a failed upload.
- It keeps focus in the replace confirm, in the picker and in the Save to new
  branch dialog.
- It writes no field when the branch changes while the file is sending.
- It turns a drop away during a save, on read-only storage and after a refused
  upload.
- It fills the correct item of an object and of a list, also after an insert,
  a move or a remove.
- It opens the Save to new branch dialog on a protected branch, and shows the
  outcome of the branch step under the field.

`admin/field-labels.test.tsx` checks that the row label names the group.
