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
| `list(folder, { cursor, limit }?)` | Returns one page of the items in `folder`: folders first, then files. `cursor` in the result gives the next page. |
| `delete(path)` | Deletes one file. It does not delete a folder. |
| `resolveUrl(path)` | Returns the URL that a page loads for the media path. |

`useMediaSlice()` (`@tinacms/tinacms/react`) gives the slice. If no plugin
mounts a slice with all four operations, it throws
`media-capability-missing`.

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

`tinaLocalDataLayerVitePlugin` serves the endpoint. Give it the same
`mediaUrl` and `mediaRoot` if you change them.

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
