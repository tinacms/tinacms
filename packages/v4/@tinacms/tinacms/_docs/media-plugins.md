# Media plugins

A media plugin supplies the `media` capability. `media` is a singleton
capability: a project installs one plugin that provides `media`. A second one
throws an error at boot, unless it declares `overrides`. The plugin can provide
other singleton capabilities too, with one slice for each in `slices`. Refer
to [plugins.md](./plugins.md#capabilities). Refer to
[ADR-022](https://github.com/tinacms/tinacmsv4-docs/blob/main/adr/022-media-capability-contract.md)
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
| `upload(file, folder?)` | Saves the file in `folder`, and returns its media path. |
| `list(folder, { cursor, limit, search, extensions }?)` | Returns one page of the items in `folder`: folders first, then files. `cursor` in the result gives the next page. |
| `delete(path)` | Deletes one file. It does not delete a folder. |
| `resolveUrl(path, { width, height }?)` | Returns the URL that a page loads for the media path. |

`useMediaSlice()` (`@tinacms/tinacms/react`) gives the slice. If no plugin
mounts a slice with all four operations, it throws
`media-capability-missing`.

### Optional additions

A provider can supply more. Each addition is optional. The
[Media Manager](./media-manager.md) shows a control only when the provider
supplies the addition for it.

| Addition | Role |
|---|---|
| `list(..., { search })` | Returns only the items whose name matches `search`. Set `features.search` when `list` uses it. |
| `list(..., { extensions })` | Returns only the files with one of the extensions, for example `['jpg', 'png']`. Extensions are lowercase and have no dot. Set `features.extensionFilter` when `list` uses it. |
| `resolveUrl(path, { width, height })` | Returns a URL for an image at that size. A provider without image transforms ignores the options and returns the original URL ([ADR-022](https://github.com/tinacms/tinacmsv4-docs/blob/main/adr/022-media-capability-contract.md) §5). |
| `rename(from, to)` | Moves a file to a new media path in the same media root, and returns the new path. On failure it throws `MediaError`. |
| `features` | Tells the UI what the provider supports. Refer to the next table. |
| `status()` | Returns `{ kind: 'ready' }`, or `{ kind: 'needs-setup', message, actionLabel, actionUrl }` when the media store needs setup before use. |

| `features` field | Role |
|---|---|
| `search` | `list` uses `search`. |
| `extensionFilter` | `list` uses `extensions`. |
| `acceptedMimeTypes` | The MIME types that `upload` accepts, such as `application/pdf`, or a wildcard such as `image/*`. |
| `acceptedExtensions` | The extensions that `upload` accepts, lowercase and without the dot, such as `svg`. |
| `maxSize` | The largest file that `upload` accepts, in bytes. Each media plugin sets its own limit. If it is not set, the Media Manager does not check the size before an upload. |
| `readOnly` | The provider does not upload, rename or delete. |

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
| `unsupported` | The media store cannot do the operation. |
| `backend-failure` | The media store failed. |

`localMediaPlugin()` supplies none of the optional additions.

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
`{url}?folder=posts`. `delete` is a JSON request to `{url}`.

The dev server accepts files up to 25 MB (`MAX_MEDIA_UPLOAD_BYTES`). This
limit applies to `localMediaPlugin()` only. Other media plugins, such as
TinaCloud, have their own limits. `localMediaPlugin()` does not set
`features.maxSize`, so the Media Manager does not check the size first. A
larger file fails at upload with a `too-large` error.

A multipart request does not get a CORS preflight. Thus a page on a different
site can send one. The endpoint rejects a request that is not from a loopback
host, that has a different `Origin`, or that has `Sec-Fetch-Site: cross-site`.
The content endpoint uses the same checks.

### Paths

The plugin rejects a path that goes outside the media folder, through `..` or
through a symbolic link. It rejects a file name that holds a path separator.

## `tinaCloud()`

`tinaCloud()` keeps media in TinaCloud. It provides `media`, with one slice in
`slices.media`. A later release adds the `auth` capability to the same plugin.

```ts
import { defineConfig, localContentPlugin, tinaCloud } from '@tinacms/tinacms';

export default defineConfig({
  plugins: [
    localContentPlugin(),
    tinaCloud({ clientId: '<client id>', getToken: () => readToken() }),
  ],
  schema: { collections: [] },
});
```

| Option | Role |
|---|---|
| `clientId` | The client ID of the TinaCloud project. |
| `getToken` | Returns the TinaCloud access token of the editor, or `undefined`. It can return a promise. |

`getToken` is interim. When `tinaCloud()` provides `auth`, the plugin gets the
token itself and the option goes. Until then, the app supplies the token. With
no token, each operation fails with `unauthorized`.

The slice supplies `rename`, `features.search`, `features.extensionFilter` and
a `features.maxSize` of 100 MB. `resolveUrl` gives a CDN URL, and a size adds
a crop: `?fit=crop&max-w=400&max-h=400`.

### Branch

Each operation reads the branch from `store.branch.name` when it runs. If
`name` is not set, the operation uses the default branch of the TinaCloud
project. The branch is not a config option: it is operational data that the
Data Layer owns (ADR-019, ADR-024). No plugin writes `store.branch.name` yet,
so all operations use the default branch.

On first use the slice reads the project from
`https://identity.tinajs.io/v2/apps/{clientId}` for its default branch and its
media branch, then keeps it for the session.

| Branch | URL of `posts/hero.jpg` |
|---|---|
| The media branch | `https://assets.tina.io/{clientId}/posts/hero.jpg` |
| Any other branch | `https://assets.tina.io/{clientId}/__staging/{branch}/__file/posts/hero.jpg` |

### Not supported yet

- The `auth` capability. It replaces `getToken`.
- Media on an editorial workflow branch.
- Static media, built at build time.
- An assets API URL other than `https://assets.tinajs.io`.
