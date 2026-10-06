# Media plugins

A media plugin supplies the `media` capability. `media` is a singleton
capability: a project installs one media plugin. A second media plugin throws
an error at boot, unless it declares `overrides`. Refer to
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
| `rename(from, to)` | Moves a file to a new media path in the same media root, and returns the new path. On failure it throws `MediaRenameError`. |
| `features` | Tells the UI what the provider supports. Refer to the next table. |
| `status()` | Returns `{ kind: 'ready' }`, or `{ kind: 'needs-setup', message, actionLabel, actionUrl }` when the media store needs setup before use. |

| `features` field | Role |
|---|---|
| `search` | `list` uses `search`. |
| `extensionFilter` | `list` uses `extensions`. |
| `acceptedMimeTypes` | The MIME types that `upload` accepts, such as `application/pdf`, or a wildcard such as `image/*`. |
| `acceptedExtensions` | The extensions that `upload` accepts, lowercase and without the dot, such as `svg`. |
| `maxSize` | The largest file that `upload` accepts, in bytes. |
| `readOnly` | The provider does not upload, rename or delete. |

`MediaRenameError` has a `code`:

| Code | Meaning |
|---|---|
| `not-found` | The file at `from` does not exist. |
| `name-taken` | A file at `to` exists. |
| `invalid-name` | The new file name is not valid. |
| `invalid-path` | `to` is not a valid media path. |
| `unauthorized` | The user cannot rename the file. |
| `unsupported` | The media store cannot rename files. |
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
`file` field and an optional `folder` field. The limit is 25 MB. `list` is a
`GET` request to `{url}?folder=posts`. `delete` is a JSON request to `{url}`.

A multipart request does not get a CORS preflight. Thus a page on a different
site can send one. The endpoint rejects a request that is not from a loopback
host, that has a different `Origin`, or that has `Sec-Fetch-Site: cross-site`.
The content endpoint uses the same checks.

### Paths

The plugin rejects a path that goes outside the media folder, through `..` or
through a symbolic link. It rejects a file name that holds a path separator.
