# Media Plugins

> **Canonical sources:** [ADR-007](../007-full-stack-plugins-client-backend-segments.md), [ADR-008](../008-authorization-permissions-roles.md); [CONTEXT.md](../CONTEXT.md) for **Plugin**, **Capability**, **Capability RPC**, **Server segment**.

A media plugin provides the **singleton `media` capability**. It is the canonical full-stack plugin: a server segment holds the SDK and secrets, a client segment renders the picker UI, and the two talk over **Capability RPC**.

## Manifest

```ts
import { definePlugin } from 'tinacms'

export default definePlugin({
  name: 's3-media',
  provides: ['media'],
  dependsOn: ['auth'],                  // the RPC transport authenticates via `auth`
  client: () => import('./client'),
  server: () => import('./server'),
  permissions: [                        // declared permissions become a typed `Permission` union
    { name: 'media:upload', description: 'Upload new media' },
    { name: 'media:delete', description: 'Delete media files' },
  ],
})
```

`media` is **singleton**: one provider per project. Installing a second media plugin is a **Capability conflict** — the runtime refuses to start unless one is intentionally `overrides`-d.

## Server segment

The server segment holds the SDK, secrets, and any file-touching code. It is framework-neutral — the per-framework adapter (`tinacms/next`, `tinacms/express`, …) mounts it.

```ts
// server.ts
import { defineServerPlugin, protectedOp, publicOp } from 'tinacms/server'
import { S3 } from '@aws-sdk/client-s3'

const s3 = new S3({ region: process.env.AWS_REGION })

export default defineServerPlugin({
  // Protected by default — RPC transport authenticates before dispatch
  async upload(input: { file: File; path: string }) {
    await s3.putObject({ Bucket: BUCKET, Key: input.path, Body: input.file })
    return { url: `https://${BUCKET}.s3.amazonaws.com/${input.path}`, path: input.path }
  },

  async list(input: { path: string; cursor?: string }) {
    const r = await s3.listObjectsV2({ Bucket: BUCKET, Prefix: input.path, ContinuationToken: input.cursor })
    return { items: r.Contents?.map(toMediaItem) ?? [], cursor: r.NextContinuationToken }
  },

  // Permission-gated
  delete: protectedOp({ permission: 'media:delete' }, async (input: { path: string }) => {
    await s3.deleteObject({ Bucket: BUCKET, Key: input.path })
  }),

  // The greppable opt-out for public endpoints
  health: publicOp(async () => ({ ok: true })),
})
```

Three authorization tiers, all from [ADR-008](../008-authorization-permissions-roles.md):

| Wrapper | Meaning |
|---|---|
| bare handler | authenticated session required (default) |
| `protectedOp({ permission })` | authenticated **and** holding the named permission |
| `publicOp()` | no auth required — `grep publicOp` enumerates this attack surface |

## Client segment

The client segment is React + a namespaced Zustand slice mounted at `store.media` at boot.

```ts
// client.ts
import { defineClientPlugin, server } from 'tinacms'

export default defineClientPlugin({
  // namespaced slice — composed once at boot under store.media
  slice: (set, get) => ({
    items: [],
    selected: null,
    cursor: undefined,

    async load(path: string) {
      const r = await server.media.list({ path })          // typed RPC
      set({ items: r.items, cursor: r.cursor })
    },

    async upload(file: File, path: string) {
      const r = await server.media.upload({ file, path })  // protected by default
      set((s) => ({ items: [r, ...s.items] }))
      return r
    },

    select(item) { set({ selected: item }) },
  }),

  components: { MediaPicker, MediaBrowser },
})
```

The `server.media.upload(...)` proxy is typed end-to-end by `import type` from `server.ts` — no codegen, no hand-written shared interface, and none of the AWS SDK ends up in the browser bundle. ([ADR-007](../007-full-stack-plugins-client-backend-segments.md))

## Reading media from elsewhere

A field plugin (e.g. an `image` field) reads the media slice by namespace:

```tsx
import { useTinaStore } from 'tinacms'

function ImageField() {
  const picker = useTinaStore((s) => s.media.MediaPicker)
  const upload = useTinaStore((s) => s.media.upload)
  // …
}
```

It depends on the capability, not the plugin:

```ts
definePlugin({
  name: 'image-field',
  provides: ['field'],
  dependsOn: ['media'],          // any media provider — s3, cloudinary, local
  client: () => import('./client'),
})
```

That is the swap-an-implementation promise — replacing `s3-media` with `cloudinary-media` requires zero changes to the image field plugin.

## Built-in providers

Shipped with `tinacms`:

- **`localMedia()`** — writes to the user's filesystem (e.g. `public/uploads`). The default for local dev; runs in the user's Backend.
- **`tinaCloudMedia()`** — uses the TinaCloud image CDN. Bundled with `tinaCloud()` since TinaCloud provides multiple capabilities at once (`content` + `media` + optionally `auth` + `search`).

Common third-party shapes (community / future):

- `s3Media({ bucket, region })`
- `cloudinaryMedia({ cloudName })`
- `gcsMedia({ bucket })`

## Configuration

```ts
import { defineConfig } from 'tinacms'
import { s3Media } from '@tinacms/s3-media'

export default defineConfig({
  plugins: [
    s3Media({
      bucket: process.env.S3_BUCKET!,
      region: process.env.S3_REGION!,
    }),
    // … other plugins
  ],
})
```

The plugin function returns the manifest; its config is captured in the closure of the lazy `() => import('./server')` segment.

## Open sub-decisions

- **Binary / non-JSON payloads** (file uploads, `Date`, `Map`): RPC needs a serialization codec — multipart/`FormData` for binary, a superjson-style codec for rich JSON. Tracked in [ADR-007](../007-full-stack-plugins-client-backend-segments.md).

## Related

- [Plugin System](../architecture/plugin-system.md)
- [Custom Plugins](./custom-plugins.md) — full-stack patterns
- [Media Management](../systems/media-management.md)
- [ADR-007](../007-full-stack-plugins-client-backend-segments.md), [ADR-008](../008-authorization-permissions-roles.md)
