# The Media Manager

`mediaManagerPlugin()` adds the Media pane: a pane beside the side nav to
browse, upload, move, download and delete media. It holds no media itself. It
uses the media plugin that the project installs, through `useMediaSlice()`.
Refer to [media-plugins.md](./media-plugins.md) for the media contract.

```ts
import {
  defineConfig,
  localContentPlugin,
  localMediaPlugin,
  mediaManagerPlugin,
} from '@tinacms/tinacms';

export default defineConfig({
  plugins: [localContentPlugin(), localMediaPlugin(), mediaManagerPlugin()],
  schema: { collections: [] },
});
```

The plugin declares `dependsOn: ['media']`. Without a media plugin, the admin
throws an error at boot.

## What it adds

| Part | Value |
|---|---|
| Screen | `media`, at `#/screens/media`. The admin shows it as a pane beside the side nav. |
| Sidebar | A "Media" `globalNav` entry that opens the pane |

The main area keeps showing the page that was open before. Close returns to
that page. A link to `#/screens/media/posts/2026` opens the pane at the folder
`posts/2026` with Home in the main area, so a folder link can be shared. Back
steps out through the folders before it leaves Media.

## What the pane does

- **Layout.** On a desktop, the Maximise button in the header widens the pane
  over the main area, and Restore returns it. On a tablet the pane opens
  maximised. On a phone it fills the screen.
- **Browse.** The pane lists folders first, then files, in Grid or List. The
  folder trail shows the path above the files. A line at the foot counts
  the folders and files. The next page loads when you scroll near the end.
- **Search.** The search box shows when `features.search` is `true`. It
  filters the open folder by file name and shows the number of hits.
- **New folder.** The dialog refuses a name with spaces or bad characters, and a
  name that exists. A folder that has no file disappears when you leave it.
- **Details.** A click on a file opens its details: the whole picture, the
  folder, the type, and how many documents use the file. Copy URL copies the
  absolute URL. Delete asks first. With a wide pane the details sit beside the
  files. With a narrow pane they replace the files, and Back returns.
- **Select mode.** Select lets you choose several files. The bar offers
  Download, Copy URLs, Move and Delete.
- **Delete.** Delete always asks first. The dialog lists the documents that use
  the file, including your own unsaved edits. Saved documents come from the
  `search` capability. Without it, only your unsaved edits show, and the dialog
  says that it could not check. The list warns and never blocks. Open on a
  document cancels the delete and opens the document.
- **Move.** Move puts the selected files in a folder that you choose. The
  provider needs `rename`. Move warns the same way as Delete: documents that
  store the old path show a missing file afterward.
- **Download.** Download saves each selected file under its own name. If the
  media store refuses the download, a message names how many files failed.
- **Protected branch.** On a protected branch, Delete and Move are off. A note
  under the header says to switch to another branch. Select mode, Download and
  Copy URLs still work.
- **Upload.** "Upload" and drag and drop work as before. The browser rejects a
  file that has the wrong type or is too large.
- **States.** The pane shows a loading look, an empty look, a no-results look, a
  can't-load look with "Try again", and a not-set-up look with the provider's
  link.

The pane has no Rename and no filters for kind or type. Pick mode keeps its
filters.

## What depends on the provider

The pane shows some controls only when the media provider supports them.

| Control | Shows when |
|---|---|
| Search box | `features.search` is `true` |
| Move | The provider has `rename`. It is off, with the lock note, when `features.readOnly` is `true` |
| New folder, Delete | `features.readOnly` is not `true` |
| Upload, drag and drop | `features.readOnly` is not `true` |
| Not-set-up look, in place of the library | `status()` returns `needs-setup` |

A delete or move that the storage refuses with `unauthorized` turns Delete and
Move off with "You don't have permission to delete." The lock lasts until the
branch changes, the editor signs in again or the page reloads. If the editor is
not signed in, the pane says "Your session has expired. Sign in again." and
locks nothing.

The upload checks use `features.acceptedMimeTypes`,
`features.acceptedExtensions` and `features.maxSize`. A file passes the type
check if it matches one MIME type or one extension. If the provider sets
neither list, the pane accepts the default v3 list: text, images, video, PDF,
office documents and some 3D formats.

`resolveUrl` gets a size for each image: 400x400 for the grid, 80x80 for the
list. A provider without image transforms ignores the size.

## Pick mode

`MediaBrowser` (`@tinacms/tinacms/react`) is the browser for a field that
selects media. It has one mode, `pick`. The details panel has an "Insert"
button, and no Rename or Delete.
The browser keeps the open folder in its own state, not in the URL.
The [`image` field](./image-field.md) uses `pick` mode in a dialog.

```tsx
import { MediaBrowser } from '@tinacms/tinacms/react';

<MediaBrowser
  mode='pick'
  accept='image'
  onSelect={(item) => setValue(item.path)}
/>;
```

| Prop | Role |
|---|---|
| `mode` | `'pick'`. |
| `onSelect(item)` | Gets the file when the user clicks "Insert". |
| `accept` | A category (`image`, `video`, `audio`, `document`), an extension, or a list of them. |
| `folder`, `onFolderChange` | Optional. Give both to control the open folder. |

`accept` replaces `features.acceptedMimeTypes` and
`features.acceptedExtensions` for the upload checks. If the provider
sets `features.extensionFilter`, `accept` also limits the list. Then a locked
chip such as "Images only" shows in place of the type filter.

## Not supported yet

- A folder is not a real object. "New Folder" does not create it on the
  provider.
- `localMediaPlugin()` supplies `rename`, so Move works. It supplies no search.
- `tinaCloud()` has no Move, because its rename endpoint does not move a file to
  another folder.
