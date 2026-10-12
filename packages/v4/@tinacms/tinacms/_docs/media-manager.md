# The Media Manager

`mediaManagerPlugin()` adds the Media Manager: an admin screen to browse,
upload, rename and delete media. It holds no media itself. It uses the media
plugin that the project installs, through `useMediaSlice()`. Refer to
[media-plugins.md](./media-plugins.md) for the media contract.

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
| Screen | `media`, at `#/screens/media` |
| Sidebar | A "Media" `globalNav` entry that opens the screen |

The URL holds the open folder. `#/screens/media/posts/2026` opens the folder
`posts/2026`, so a folder link can be shared and Back works.

## What the screen does

The screen shows a `MediaBrowser` in `manage` mode.

- **Views.** A toggle changes between a grid and a list. The grid is the
  default. The grid shows folders and files in different sections.
- **Tiles.** An image shows a thumbnail on a checkerboard. A video shows a
  dark tile with a play icon. Other files show a file icon. Each file shows a
  badge with its type, and `jpg` shows as `JPEG`.
- **Details.** A click on a file opens the details panel. A second click on
  the same file closes it. The panel shows a large preview and the full URL.
  A click on the URL copies it. The panel has Rename and Delete buttons.
- **Folders.** A click on a folder opens it. The breadcrumb starts at "Media",
  and each folder in it opens on a click. The arrow opens the parent folder.
- **Toolbar.** "Refresh" loads the folder again. "New Folder" opens a folder
  that does not exist yet. The folder disappears if you leave it before you
  upload a file to it. "Upload" uploads files to the open folder.
- **Drag and drop.** Files dropped on the media area upload to the open
  folder. The area shows an orange border during the drag.
- **Upload checks.** The browser rejects a file that has the wrong type or is
  too large. An alert names each rejected file and the reason. New files show
  a "NEW" badge, go to the top of the list, and the first one opens in the
  details panel.
- **All, Folders, Files.** A toggle shows all items, folders only or files
  only.
- **Infinite scroll.** The next page loads when you scroll to the end.
- **Rename.** You can change the base name. The extension does not change.
  The dialog shows the safe file name that the provider gets. Renaming does
  not update content that uses the old path.
- **Delete.** Delete asks for confirmation first.
- **States.** The browser shows a loading state, an error state with
  "Try again", and an empty state.

## What depends on the provider

The browser shows some controls only when the media provider supports them.

| Control | Shows when |
|---|---|
| Search box | `features.search` is `true` |
| "Any type" filter | `features.extensionFilter` is `true` |
| Rename | The provider has `rename`, and `features.readOnly` is not `true` |
| Toolbar, upload, drag and drop, Delete | `features.readOnly` is not `true` |
| Setup banner, in place of the browser | `status()` returns `needs-setup` |

The upload checks use `features.acceptedMimeTypes`,
`features.acceptedExtensions` and `features.maxSize`. A file passes the type
check if it matches one MIME type or one extension. If the provider sets
neither list, the browser accepts the default v3 list: text, images, video,
PDF, office documents and some 3D formats.

`resolveUrl` gets a size for each image: 400x400 for the grid, 75x75 for the
list and 1000x1000 for the details panel. A provider without image transforms
ignores the size.

## Pick mode

`MediaBrowser` (`@tinacms/tinacms/react`) also has a `pick` mode, for a field
that selects media. In `pick` mode the details panel has an "Insert" button.
The browser keeps the open folder in its own state, not in the URL.

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
| `mode` | `'manage'` or `'pick'`. |
| `onSelect(item)` | `pick` only. Gets the file when the user clicks "Insert". |
| `accept` | `pick` only. A category (`image`, `video`, `audio`, `document`), an extension, or a list of them. |
| `folder`, `onFolderChange` | Optional. Give both to control the open folder. |

`accept` replaces `features.acceptedMimeTypes` and
`features.acceptedExtensions` for the upload checks. If the provider
sets `features.extensionFilter`, `accept` also limits the list. Then a locked
chip such as "Images only" shows in place of the type filter.

## Not supported yet

- A folder is not a real object. "New Folder" does not create it on the
  provider.
- `localMediaPlugin()` supplies no optional additions. With it, the screen
  has no search, no type filter and no Rename.
