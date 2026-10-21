# Media Management

> **Canonical sources:** [Media Plugins](../plugins/media-plugins.md), [ADR-007](../007-full-stack-plugins-client-backend-segments.md), [ADR-008](../008-authorization-permissions-roles.md); [CONTEXT.md](../CONTEXT.md) for Plugin, Capability, Server segment, TinaCloud.

Media is **not a separate system** — it is the singleton `media` capability, implemented by whichever plugin provides it. This doc describes the end-to-end shape of how media flows through a v4 deployment; the plugin-author contract is in [Media Plugins](../plugins/media-plugins.md).

## Where the pieces live

```
┌─ Browser ────────────────────────────────┐
│  media plugin's Client segment:          │
│    store.media slice (items, selected,…) │
│    MediaPicker, MediaBrowser components  │
│         │                                │
│         │  Capability RPC                │
│         ▼                                │
└──────────────────────────────────────────┘
┌─ Backend (user's app server) ────────────┐
│  media plugin's Server segment:          │
│    upload/list/delete operations         │
│    SDK + secrets (S3/Cloudinary/…)       │
└──────────────────────────────────────────┘
```

- **Client segment**: React + the namespaced `store.media` Zustand slice mounted at boot.
- **Server segment**: framework-neutral operations mounted as RPC routes by the per-framework adapter (`tinacms/next`, …). Holds the SDK and any secrets. Protected by default; permission-gated for destructive ops.
- **Image CDN (TinaCloud)**: an additional optional concern. `tinaCloudMedia()` uses TinaCloud's CDN for delivery + transforms; other providers may ship URLs directly from the storage backend or route through a CDN of their own.

## The MediaItem shape

```ts
interface MediaItem {
  // identity
  path: string                      // provider-relative path (S3 key, Cloudinary public_id, fs path)
  url: string                       // delivery URL (CDN or direct)
  // metadata
  filename: string
  mimeType?: string
  size?: number                     // bytes
  width?: number                    // images only
  height?: number                   // images only
  uploadedAt?: string               // ISO timestamp
}
```

The shape is stable across providers — the `image` field consumes this shape, not provider-specific shapes. That is the swap-an-implementation property of the `media` capability.

## How image fields read media

The image field plugin `dependsOn: ['media']` and reads the slice by namespace:

```tsx
import { useTinaStore, useFieldValue, useFieldAddress } from 'tinacms/react'

function ImageField() {
  const address = useFieldAddress()
  const [value, setValue] = useFieldValue<string>(address)   // stores the path
  const MediaPicker = useTinaStore((s) => s.media.MediaPicker)

  return (
    <div>
      {value && <img src={value} />}
      <MediaPicker onSelect={(item) => setValue(item.url)} />
    </div>
  )
}
```

Swapping `s3-media` for `cloudinary-media` requires zero changes to the image field plugin.

## Path and reference conventions

Two ways an image field can store its value:

1. **URL** — the delivery URL (`https://cdn.example.com/uploads/hero.jpg`). Simple; not provider-portable.
2. **Provider path** — the provider-relative key (`uploads/hero.jpg`) resolved through the media slice. Portable across deployments.

Tina core does not mandate one. The image field plugin's `metadata.imageRefStrategy` can declare which it uses; downstream consumers (preview, OG tags) read from that.

## Authorization

Per [ADR-008](../008-authorization-permissions-roles.md):

- All media server ops are **protected by default** — the RPC transport authenticates the session before dispatch.
- Destructive ops (`delete`) are **permission-gated** with `media:delete`.
- The media plugin **declares** `media:upload` and `media:delete` in its manifest; codegen aggregates them into the typed `Permission` union.

A field plugin that *uses* media doesn't gate UI itself — it reads `useHasPermission('media:upload')` to hide the upload button when the editor lacks the permission. Server enforcement is the source of truth.

## Local development

`localMedia()` (the default) writes to the project's `public/uploads/` (or a configured root). Files are committed by the developer's normal git flow — Tina does not auto-commit media in local dev (same rule as content: production Data Layers handle commit policy, local does not). ([CONTEXT.md ambiguity #5](../CONTEXT.md))

## Production providers

- **`tinaCloudMedia()`** — uploads to TinaCloud's media store; delivery via TinaCloud's image CDN with on-the-fly transforms.
- **`s3Media({ bucket, region })`** — direct S3, optional CloudFront in front.
- **`cloudinaryMedia({ cloudName })`** — uploads to Cloudinary; delivery + transforms via Cloudinary URLs.
- **`gcsMedia({ bucket })`** — Google Cloud Storage.
- Custom: any plugin that satisfies the server-segment shape from [Media Plugins](../plugins/media-plugins.md#server-segment).

## Open

- **Binary payload codec for RPC.** Upload is the canonical case for non-JSON RPC payloads (multipart/`FormData` or a superjson-style codec). Tracked in [ADR-007](../007-full-stack-plugins-client-backend-segments.md).

## Related

- [Media Plugins](../plugins/media-plugins.md) — plugin author contract
- [Plugin System](../architecture/plugin-system.md)
- [ADR-007](../007-full-stack-plugins-client-backend-segments.md), [ADR-008](../008-authorization-permissions-roles.md)
