# Media plugins

A media plugin supplies the `media` capability. `media` is a singleton
capability: a project installs one plugin that provides `media`. A second one
throws an error at boot, unless it declares `overrides`. The plugin can provide
other singleton capabilities too, with one slice for each in `slices`. Refer
to [plugins.md](./plugins.md#capabilities). Refer to
[ADR-022](../../../../../adr/v4/022-media-capability-contract.md)
for the decision.

## Media paths

Content stores a media path, not a URL. A media path is relative to the media
root, for example `posts/hero.jpg`. Thus a project can change its media plugin,
and the content does not change. The plugin turns a path into a URL with
`resolveUrl`.

## The contract

A media plugin mounts a slice at `store.media`. The slice is a `MediaProvider`
(`core/media/contract.ts`):

| Operation | Role |
|---|---|
| `upload(file, folder?, { onProgress, signal }?)` | Saves the file in `folder`, and returns its media path. It never overwrites a file. |
| `list(folder, { cursor, limit, search, extensions }?)` | Returns one page of the items in `folder`: folders first, then files. `cursor` in the result gives the next page. |
| `delete(path)` | Deletes one file. It does not delete a folder. |
| `resolveUrl(path, { width, height }?)` | Returns the URL that a page loads for the media path. |

`useMediaSlice()` (`@tinacms/tinacms/react`) gives the slice. If no plugin
mounts a slice with all four operations, it throws
`media-capability-missing`.

### Upload rules

`upload` never overwrites. When the name exists in the folder, it rejects with
`name-taken`, the same rule and the same code as `rename`. The admin then
sends the file again as `name-1.ext`, then `name-2.ext`, up to 20 names. Thus a
provider that always answers `name-taken` makes the admin try 20 names.

The third argument is optional, and so is each of its fields:

| Option | Role |
|---|---|
| `onProgress(fraction)` | The provider calls it with the fraction of the bytes sent so far, from 0 to 1. The admin shows it as the progress of the file. A provider that does not call it gets a row with no percentage. |
| `signal` | An `AbortSignal`. The admin aborts it when the editor cancels the upload. |

Two rules apply to `signal`:

- An aborted upload rejects with a `DOMException` named `AbortError`, not with
  a `MediaError`.
- After the provider sends the last byte, it ignores the signal. The upload
  then settles with its real outcome.

### On the site

The site renders media without the editor, so it has no slice. A media plugin
also sets `media.resolveUrl` on its manifest: a sync function with no secrets
that gives the same URL as the `resolveUrl` of the slice. `resolveMediaUrl(config,
path, options?)` (`@tinacms/tinacms`) calls it. Refer to
[media.md](./media.md#rendering-media-on-the-site). `media.resolveUrl` is
optional, but without it `resolveMediaUrl` throws `media-plugin-no-resolve-url`.

### Optional additions

A provider can supply more. Each addition is optional. The
[Media Manager](./media-manager.md) shows a control only when the provider
supplies the addition for it.

| Addition | Role |
|---|---|
| `list(..., { search })` | Returns only the items whose name matches `search`. Set `features.search` when `list` uses it. |
| `list(..., { extensions })` | Returns only the files with one of the extensions, for example `['jpg', 'png']`. Extensions are lowercase and have no dot. Set `features.extensionFilter` when `list` uses it. |
| `resolveUrl(path, { width, height })` | Returns a URL for an image at that size. A provider without image transforms ignores the options and returns the original URL ([ADR-022](../../../../../adr/v4/022-media-capability-contract.md) §5). |
| `rename(from, to)` | Optional. Moves a file to a new media path, which can be in another folder, and returns the new path. It never overwrites a file. A provider with `rename` lets the Media pane move files. On failure it throws `MediaError`. |
| `features` | Tells the UI what the provider supports. Refer to the next table. |
| `status()` | Returns `{ kind: 'ready' }`, or `{ kind: 'needs-setup', message, actionLabel, actionUrl }` when the media store needs setup before use. |

| `features` field | Role |
|---|---|
| `search` | `list` uses `search`. |
| `extensionFilter` | `list` uses `extensions`. |
| `acceptedMimeTypes` | The MIME types that `upload` accepts, such as `application/pdf`, or a wildcard such as `image/*`. |
| `acceptedExtensions` | The extensions that `upload` accepts, lowercase and without the dot, such as `svg`. |
| `maxSize` | The largest file that `upload` accepts, in bytes. Each media plugin sets its own limit. If it is not set, the Media Manager does not check the size before an upload. |
| `readOnly` | The provider does not upload, move or delete. |

Each operation reports a known failure as a `MediaError`. It has a `code`,
a `message` to show the user, and an optional `detail` for logs:

| Code | Meaning |
|---|---|
| `not-found` | The file does not exist. |
| `name-taken` | A file with that name exists. |
| `invalid-name` | The file name is not valid. |
| `invalid-path` | The media path is not valid. |
| `too-large` | The file is larger than the provider accepts. |
| `unauthorized` | The user cannot do the operation. |
| `unsupported` | The media store cannot do the operation, or it does not accept the file type. |
| `backend-failure` | The media store failed. |

`localMediaPlugin()` supplies `rename`, a `features.maxSize` of 24 MB and a
`features.acceptedExtensions` list.

## `localMediaPlugin()`

`localMediaPlugin()` writes media to the disk of the project, in
`{publicFolder}/uploads` (`public/uploads` by default). The dev server serves
that folder, so `resolveUrl('posts/hero.jpg')` gives `/uploads/posts/hero.jpg`.

```ts
import { defineConfig, localContentPlugin, localMediaPlugin } from '@tinacms/tinacms';

export default defineConfig({
  plugins: [localContentPlugin(), localMediaPlugin()],
  schema: { collections: [] },
});
```

| Option | Default | Role |
|---|---|---|
| `url` | `/api/tina/media` | The media endpoint of the dev server. |
| `mediaRoot` | `uploads` | The folder in the public folder that holds media. |

`tinaLocalDataLayerVitePlugin` serves the endpoint only when the loaded config
includes `localMediaPlugin()`. Give it the same `mediaUrl` and `mediaRoot` if
you change them.

### Upload

The browser sends the file as `multipart/form-data` to `{url}/upload`, with a
`file` field and an optional `folder` field. `list` is a `GET` request to
`{url}?folder=posts`. `delete` and `rename` are JSON requests to `{url}`:
`{ op: 'delete', path }` and `{ op: 'rename', from, to }`. `rename` moves a file
to a path in an existing folder, returns `{ path }`, and never overwrites.

An upload never overwrites. The dev server writes the bytes to a hidden
temporary file in the target folder, then gives that file its name only if the
name is free. A name that a file or a folder has gives a `name-taken` error,
and the existing file does not change. `list` never shows the temporary file.

Local media stores only the file types of the media type table: `jpg`, `jpeg`,
`png`, `gif`, `webp`, `svg`, `avif`, `ico`, `mp4`, `webm`, `mov`, `mp3`, `wav`,
`ogg`, `pdf`, `json`, `csv` and `txt`. The slice reports these extensions as
`features.acceptedExtensions`, so the Media Manager refuses another type
before it sends a byte. The dev server reads the extension from the file name
and does not read the type that the request reports. A name with another
extension, or with no extension, gives an `unsupported` error and the dev
server writes nothing. `rename` keeps the file type: a target with another
extension gives an `unsupported` error. A file of another type that is
already in the media folder still lists, moves, renames with its extension,
and deletes.

The browser sends the file with `XMLHttpRequest`, so the slice reports
progress. When the signal aborts before the last byte, the browser stops the
request and the dev server writes no file.

The dev server accepts a request body up to 25 MB (`MAX_MEDIA_UPLOAD_BYTES`).
The body holds the file and the form around it. Thus `localMediaPlugin()` sets
a `features.maxSize` of 24 MB, and the Media Manager refuses a larger file
before it sends a byte. A body over 25 MB still fails at upload with a
`too-large` error. If the browser sees only a closed connection, the upload
fails, and the editor can try again. These limits apply to
`localMediaPlugin()` only. Other media plugins, such as TinaCloud, have
their own limits.

A multipart request does not get a CORS preflight. Thus a page on a different
site can send one. The endpoint rejects a request that is not from a loopback
host, that has a different `Origin`, or that has `Sec-Fetch-Site: cross-site`.
The content endpoint uses the same checks.

Vite serves a new file in the public folder only after its file watcher
reports the file. Until then, a request for a just-uploaded image gets a 404.
Thus the dev server serves each file that it uploaded itself, from the media
folder, and gives every other request to Vite.

### Paths

The plugin rejects a path that goes outside the media folder, through `..` or
through a symbolic link. It rejects a file name that holds a path separator.

## `tinaCloud()`

`tinaCloud()` keeps media and content in TinaCloud. It provides `media`,
`auth` and `content`, with one slice each in `slices.media`, `slices.auth` and
`slices.content`. Refer to [auth-plugins.md](./auth-plugins.md#tinacloud) for
the sign-in flow.

`tinaCloud()` provides `content`, so it cannot sit next to
`localContentPlugin()`. Swap all of it for the local plugins in local
development:

```ts
import {
  defineConfig,
  localContentPlugin,
  localMediaPlugin,
  tinaCloud,
} from '@tinacms/tinacms';

const clientId = import.meta.env.TINA_PUBLIC_CLIENT_ID;
const isLocal = !clientId;

export default defineConfig({
  plugins: [
    ...(isLocal
      ? [localContentPlugin(), localMediaPlugin()]
      : [tinaCloud({ clientId })]),
  ],
  schema: { collections: [] },
});
```

| Option | Role |
|---|---|
| `clientId` | The client ID of the TinaCloud project. |

The media and content slices send the TinaCloud token from `tinaCloud()`'s own
sign-in. Before the editor signs in, each operation fails with
`unauthorized`. With `auth` overridden, each operation fails. Refer to
[auth-plugins.md](./auth-plugins.md#swap-a-provider).

`upload` sends the file to a signed URL with `XMLHttpRequest`, so the slice
reports progress. When TinaCloud answers 412 to the request for that URL, the
file exists: the upload rejects with `name-taken` and sends no bytes.

The slice supplies `features.search`, `features.extensionFilter` and
a `features.maxSize` of 100 MB. It has no `rename`, because the TinaCloud rename
endpoint does not move a file to another folder, so the Media pane hides Move.
`resolveUrl` gives a CDN URL, and a size adds
a crop: `?fit=crop&max-w=400&max-h=400`.

### Branch

Each operation reads the branch from `store.branch.current` when it runs. If
`current` is not set, the operation uses the default branch of the TinaCloud
project. The branch is not a config option: it is operational data that the
Data Layer owns (ADR-019, ADR-024). The Branch switcher writes `store.branch.current`; until an editor
switches, all operations use the default branch.

`media.resolveUrl` on the manifest runs on the site, which has no store, so it
always gives the URL on the media branch.

On first use the slice reads the project from
`https://identity.tinajs.io/v2/apps/{clientId}` for its default branch and its
media branch, then keeps it for the session.

| Branch | URL of `posts/hero.jpg` |
|---|---|
| The media branch | `https://assets.tina.io/{clientId}/posts/hero.jpg` |
| Any other branch | `https://assets.tina.io/{clientId}/__staging/{branch}/__file/posts/hero.jpg` |

### Not supported yet

- Media on an editorial workflow branch.
- Static media, built at build time.
- An assets API URL other than `https://assets.tinajs.io`.
