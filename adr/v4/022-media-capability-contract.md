# ADR-022: Media Capability Contract

## Status
**Accepted** — defines the `media` capability (the running example since [ADR-002](./002-plugin-first-architecture.md)/[ADR-007](./007-full-stack-plugins-client-backend-segments.md) but never formally specified) and **resolves ADR-007's open binary-payload sub-decision** for file uploads. Builds on [ADR-007](./007-full-stack-plugins-client-backend-segments.md) (segments / RPC), [ADR-008](./008-authorization-permissions-roles.md) (permissions), [ADR-009](./009-field-plugins.md) (field plugins), [ADR-015](./015-execution-boundary.md) (execution boundary), [ADR-017](./017-content-model.md) (JSON-native content values).

## Context
`media` has been the poster child for full-stack plugins since the start, but never had a contract: what an `image` field stores, the operation set, how binary upload actually works (ADR-007 explicitly left this open), and transforms.

## Decision

### 1. Singleton capability; provider = client picker + server upload
**TinaCloud** (store + image CDN) or **s3 / Cloudinary / local / self-hosted**. The **Server segment** holds secrets on the **Backend** (execution boundary, ADR-015); the **Client segment** is the picker/manager UI. **Dual-consumer**: the editor *picks and uploads*, the website *renders*.

### 2. An `image` field stores a media-root-relative *path*
The `image` field is a **Field plugin** (keyed `image`) that **`dependsOn: ['media']`**; its value is a **JSON-native path string** (`posts/hero.jpg`) — **not** a URL or opaque id. The provider **resolves path → URL** at render. This is **portable, git-native, and provider-swappable** (swap providers and content is untouched), and consistent with "content values are JSON-native, no codecs" (ADR-017). Resolution (prepend base) is **declarative → runs anywhere**; only upload (secrets) needs the Backend.

### 3. Operations
```
upload(file, folder?) → path
list(folder, { cursor, limit })      // cursor-paginated; powers the picker
delete(path)
resolveUrl(path, transform?) → URL   // declarative; runs anywhere
```
Folders for organization.

### 4. Binary upload: presigned-direct preferred, multipart fallback — binary is scoped to media
Capability RPC is typed **JSON** request/response; a file is binary. Resolution:
- **Presigned direct upload (preferred):** a small **JSON** RPC returns a signed URL/policy; the client **PUTs bytes directly to the store** — bytes never touch the typed proxy *or* the Backend. Scalable.
- **Multipart-through-Backend (fallback):** for providers that can't presign, the media **Server segment** exposes its own multipart endpoint.

Either way, **the general Capability RPC transport stays JSON-only** — **this resolves ADR-007's open binary sub-decision by *scoping binary to the `media` capability*** rather than adding a binary mode to the typed RPC proxy. The picker just calls `upload(file) → path`; presign-vs-multipart is the provider's invisible internal choice.

### 5. Transforms are an optional provider feature
`resolveUrl(path, { width, format, … })` applies transforms where the provider supports them (TinaCloud's CDN); other providers **gracefully return the original**. A render-time / responsive-image concern, not mandatory.

## Consequences

### Positive
- Content stores **portable paths** — provider-swappable with no URL rewrites.
- The **general RPC stays JSON-only** (binary contained in `media`).
- Big uploads **bypass the Backend** (presigned); transforms degrade gracefully.

### Negative
- Presigned-direct requires provider support; the multipart fallback proxies through the Backend (its memory/body limits apply).
- `path → URL` resolution must be available wherever media renders — a thin provider-aware resolver on the website.

## Alternatives Considered
- **Store absolute URLs / opaque IDs in content** — *rejected*: non-portable / non-git-native.
- **Add a general binary mode to Capability RPC** — *rejected*: binary is media-specific; keep RPC JSON-only.
- **Mandatory transforms** — *rejected*: provider-dependent; degrade gracefully.

## References
- [CONTEXT.md](./CONTEXT.md) — `media` capability, `content` capability, Field plugin, Execution boundary, Capability RPC
- [ADR-007](./007-full-stack-plugins-client-backend-segments.md), [ADR-008](./008-authorization-permissions-roles.md), [ADR-009](./009-field-plugins.md), [ADR-015](./015-execution-boundary.md), [ADR-017](./017-content-model.md)
