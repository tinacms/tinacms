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
- **Protected branch.** On a protected branch, Upload, Delete and Move are
  off. A note under the header says to switch to another branch, and a drop on
  the library is refused with the same words. Select mode, Download and Copy
  URLs still work.
- **Upload.** Refer to [Upload](#upload).
- **States.** The pane shows a loading look, an empty look, a no-results look, a
  can't-load look with "Try again", and a not-set-up look with the provider's
  link.

The pane has no Rename and no filters for kind or type. Pick mode keeps its
filters.

## Upload

Pick files with the Upload button, or drop files on the library. The files go
to the folder that is open at that moment. If you open another folder later,
the files still go to the first folder. While you drag files over the library,
it shows "Drop to upload to" and the folder name. The pane refuses a dropped
folder and says why.

The Upload button is the last control before Maximise and Close. It has four
looks, and its position does not change between them:

| Look | Shows | A press opens |
|---|---|---|
| Idle | "Upload" | The file dialog |
| Running | A ring that fills, and "Uploading 1 of 4" ("Uploading" for one file) | The upload list |
| Done | A tick and "4 uploaded", for 5 seconds | The file dialog |
| Failed | "Upload" and a red count of the failed files, until you open the list | The upload list |

The upload list has one row for each file. A row shows the name, the progress
as a percentage, and the size. If the provider reports no progress, the row
shows no percentage. Three files upload at the same time. The other files wait
for their turn.

A name that does not fit in its row is cut in the middle. The row keeps the
start of the name, an ellipsis and the last 12 characters, so two long names
that differ only at the end stay different. A name that fits shows whole. The
full name is the tooltip of the name. A screen reader reads the full name
once, and the buttons of the row use the full name.

Each row has one action:

- **Cancel** stops a file that waits or that uploads. When all the bytes of a
  file are sent, the row has no Cancel.
- **Retry** shows after a failure that can pass on a second try, such as a
  connection error. Retry starts the file again from its original name. The
  one exception is a file for which 20 names were taken.
- **Remove** shows after a failure that cannot pass on a second try: a file
  that is too large, a file type that the storage does not accept, a name
  that is not valid, or no permission. Remove also shows for an upload that
  Media cannot confirm.

Each of the three buttons acts on the first click of a double click only. Thus
the second click cannot press the button that takes its place.

After a batch with no failure, the list empties itself 5 seconds later. A
failed file stays in the list until you retry it or remove it. A batch
continues when you close the pane.

An upload never overwrites a file. If the name is taken, Media saves the file
with a number, and the row says "marco-rossi.jpg was taken, saved as
marco-rossi-1.jpg". The number goes before the last dot of the name.

Media tries 20 names for one file. If all 20 are taken, the row fails with "A
file with that name already exists in this folder." and offers Retry. That
Retry continues from the next number and tries 20 more names. In a folder that
holds `image.png` to `image-19.png`, the first Retry saves the file as
`image-20.png`. The file keeps its place: each later Retry starts from the
number after the last name that was taken, also when a Retry failed for
another reason.

Sometimes all the bytes of a file are sent and then no answer arrives. Media
cannot know if the file is stored. The row reads "Couldn't confirm the upload.
Check Media before you upload it again." and offers Remove only, because a
second upload could store the file twice. Media loads the folder again, so a
stored file shows there. The file gets no "New" badge.

A file that you uploaded shows first among the files, after the folders, with
a "New" badge. The badge stays until you leave the folder, change the branch
or reload the page. A search hides a New file that does not match.

While a save runs, Upload is off, and the pane says "Saving. You can upload
once it finishes." The pane refuses a drop with the same words. Files that
already upload continue. Files that wait start when the save ends.

On a protected branch, Upload is off, and the pane says "main is protected.
Switch to another branch to upload, delete or move files." The pane refuses a
drop with the same words. An image field and the picker refuse a drop the
same way.

A batch belongs to the branch on which it started. If the branch changes,
files that are not yet sent stop with "The branch changed, so this stopped."
and offer Remove only.

A screen reader announces the start of a batch, each failure, a cancel and
the end. It does not announce percentages.

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

An upload that the storage refuses with `unauthorized` turns Upload off with
"You don't have permission to upload." The other files of the batch that have
not started fail with the same words and offer Remove only. The pane then
refuses a drop with those words. This lock is separate from the delete lock:
one does not turn the other on, and the pane shows a sentence for each lock
that holds. The upload lock lasts as long as the delete lock does. If the
editor is not signed in, the row says "Your session has expired. Sign in
again." and nothing locks. If the account has no access to the project, the
row says so and nothing locks.

With read-only storage, or with storage that is not set up, the pane has no
Upload button. It refuses a drop and shows the reason.

The upload checks run before any bytes are sent. They use
`features.acceptedMimeTypes`, `features.acceptedExtensions` and
`features.maxSize`. A file that fails a check shows in the upload list with
the reason and Remove. A file passes the type
check if it matches one MIME type or one extension. When the rules name
extensions and the media type table knows the extension of the file, the check
uses the MIME type of that extension. It does not use the type that the
browser reports. For an extension that the table does not know, and for rules
that hold MIME types only, the check uses the reported type. The storage has
the last word: a file that passes the check can still get an `unsupported`
error from the storage, and then the row shows that reason with Remove. If the
provider sets
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
