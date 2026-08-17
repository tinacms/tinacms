# TinaCMS Astro — Visual Editing (No React)

The Astro version of the TinaCMS kitchen-sink — same six collections, same shared content, same eight routes — but rendered with **pure Astro components**. Visual editing flows through `@tinacms/bridge`, a ~2 KB gzipped vanilla-JS bridge that talks the existing TinaCMS admin postMessage protocol. No React in the page tree, no client islands, no hydration cost outside the editor iframe.

> **Sibling example:** [`examples/astro/kitchen-sink`](../kitchen-sink/) is the same content model rendered with React via `client:tina`. Pick that one if you want React on the page; pick this one if you want to ship as little JS as possible.

## Prerequisites

- Node.js 18+ (or Bun — see [Hosting](#hosting))
- pnpm

## Development

```bash
pnpm install
cd examples/astro/visual-editing
pnpm dev          # TinaCMS + Astro (visual editing at /admin/)
pnpm dev:astro    # Astro only (no TinaCMS)
```

Site runs at `http://localhost:4321/`, admin at `http://localhost:4321/admin/`.

## Building

```bash
pnpm build        # tinacms build && astro build
pnpm build:local  # build without cloud connection (local content only)
pnpm preview      # preview the built site
```

## Routes

| Route | File | Description |
|-------|------|-------------|
| `/` | `index.astro` | Block-based home (hero, features, CTA, testimonial, content) |
| `/:slug` | `[...urlSegments].astro` | Catch-all for page collection |
| `/posts/` | `posts/index.astro` | Post listing |
| `/posts/:slug` | `posts/[...urlSegments].astro` | Post detail with rich-text body |
| `/blog/` | `blog/index.astro` | Blog listing |
| `/blog/:filename` | `blog/[filename].astro` | Blog detail |
| `/authors/` | `authors/index.astro` | Author listing |
| `/authors/:filename` | `authors/[filename].astro` | Author detail |
| `/tina-island/:name` | `tina-island/[name].ts` | Bridge refresh endpoint (only hit from inside the editor iframe) |
| `/admin/` | `public/admin/index.html` | TinaCMS admin (generated at build) |

## Collections

Same schema as the React kitchen-sink — copied verbatim from `tina/collections/` and consuming shared content via `localContentPath: '../../../shared'`:

- **Tag**, **Author**, **Global**, **Post**, **Blog**, **Page** — see [examples/AGENTS.md](../../AGENTS.md) for the unified content contract.

## How visual editing works

```
┌─────────────────────────────────┐    ┌──────────────────────────────┐
│  Admin (/admin/index.html)      │    │  Iframe (your Astro page)    │
│  React app, owns the form       │    │  Server-rendered HTML +      │
│                                 │    │  bridge script + form payloads │
│                                 │    │  spliced into <head> by        │
│                                 │    │  the tina() middleware         │
│                                 │    │                              │
│  ◀── {open, id, query, data} ◀──┼────│  bridge reads                │
│                                 │    │   [data-tina-form] elements  │
│                                 │    │                              │
│  user edits a field             │    │                              │
│  ─── {updateData, id, data} ──▶ │    │  bridge stores latest data   │
│                                 │    │                              │
│                                 │    │  bridge POSTs                │
│                                 │    │   /tina-island/post?slug=…   │
│                                 │    │   body: {[id]: data}         │
│                                 │    │                              │
│                                 │    │  Astro re-renders the island │
│                                 │    │  bridge swaps HTML in DOM    │
└─────────────────────────────────┘    └──────────────────────────────┘
```

Editable regions on the page carry two attributes:

```astro
<article data-tina-island="/tina-island/post?slug=foo">
  <h1 data-tina-field={tinaField(post.data.post, 'title')}>
    {post.data.post.title}
  </h1>
</article>
```

- **`data-tina-island`** points to a refresh endpoint. The bridge POSTs the unsaved overlay there; the endpoint re-renders the matching component with overlay data; the bridge swaps the HTML.
- **`data-tina-field`** marks individual fields for click-to-focus. Clicking the element in the iframe focuses the matching field in the admin sidebar.

The page also emits one `<div data-tina-form="…" hidden>` per editable query so the admin knows the shape of what's being edited. **You don't write that wiring** — the `tina()` integration's middleware splices both the form payloads and the `<script>` that loads `/_tina/bridge.js` into the page's `<head>` on edit-mode requests, and serves zero JS on every other request. Production HTML is byte-identical to a Tina-free Astro app.

### Stateless overlay

Edits never touch the canonical content store. The admin pushes already-resolved data to the bridge via postMessage; the bridge forwards it to the island endpoint via the request body; the endpoint reads it via `readOverlay()` from `@tinacms/bridge/preview`. Same code runs in production with no overlay — the helper falls through to the normal Tina GraphQL fetch.

`requestWithMetadata` from `@tinacms/astro` wraps the pattern in one call: it stamps the result with the metadata `tinaField()` reads, generates the form id the bridge uses to address the form, and in edit mode swaps `data` for the unsaved overlay automatically.

```ts
import { requestWithMetadata } from '@tinacms/astro';
import client from '../../tina/__generated__/client';

export const getPost = (slug: string) =>
  requestWithMetadata(client.queries.post({ relativePath: `${slug}.md` }));
```

No backend changes shipped. Works against self-hosted Tina, TinaCloud, or any GraphQL endpoint.

## Adding a new editable region

The example uses a single dynamic island endpoint backed by a registry — adding a new editable region is **one entry in `src/lib/islands.ts`**:

```ts
import type { IslandRegistry } from '@tinacms/astro/experimental';

export const islands: IslandRegistry = {
  // ...existing entries
  myFeature: {
    fetch: (request, params) => getMyFeature(params.get('id') ?? '', request),
    component: MyFeatureBody,
    wrapper: { tag: 'section', className: 'max-w-3xl mx-auto' },
    propsFromData: (data) => ({ data: data.data?.myFeature }),
  },
};
```

The dynamic route at `src/pages/tina-island/[name].ts` is a one-liner that delegates to `experimental_createIslandRoute(islands)` from `@tinacms/astro/experimental`. Use the new island in any page:

```astro
<section
  class="max-w-3xl mx-auto"
  data-tina-island="/tina-island/myFeature?id=42"
>
  <MyFeatureBody data={result.data?.myFeature} />
</section>
```

That's it — no new endpoint file, no boilerplate.

## Rich text

Tina's rich-text bodies (Plate AST) render through `TinaMarkdown` from `@tinacms/astro/TinaMarkdown.astro` — a vanilla recursive walker that mirrors the React `TinaMarkdown` API. Custom MDX components (`mdxJsxFlowElement` / `mdxJsxTextElement`) are dispatched by `node.name` against the `customComponents` map in `src/components/markdown/index.ts`.

The four shipped MDX components mirror the React kitchen-sink:

| Name | File | Notes |
|------|------|-------|
| `BlockQuote` | `markdown/BlockQuote.astro` | Recurses via `<TinaMarkdown>` for the nested rich-text body |
| `DateTime` | `markdown/DateTime.astro` | Server-renders the date, refreshes client-side via inline script |
| `NewsletterSignup` | `markdown/NewsletterSignup.astro` | Vanilla submit handler (event delegation, no React) |
| `code_block` | `markdown/CodeBlock.astro` | Plain `<pre><code>` — Prism integration is a follow-up |

Default tag overrides (`p`, `h1`–`h3`, `ul`, `ol`, `li`, `blockquote`, `hr`, `a`, `img`) live in the same map so the rendered body matches the React kitchen-sink's prose styling.

### Adding a custom MDX component

1. Add a Tina template to the rich-text field in `tina/collections/post.tsx`:

   ```ts
   { name: 'MyCallout', label: 'Callout', fields: [{ name: 'message', type: 'string' }] }
   ```

2. Create `src/components/markdown/MyCallout.astro` with a `Props` interface matching the template's fields.
3. Register it in `src/components/markdown/index.ts`:

   ```ts
   import MyCallout from './MyCallout.astro';
   export const customComponents: CustomComponentsMap = { ...existing, MyCallout };
   ```

The renderer picks it up automatically. Authors inserting the template via the Tina editor will see the rendered Astro component in the live preview.

## Hosting

Astro `output: 'server'` is required because `tina-island/*` endpoints read POST bodies at request time. Other pages can opt back into prerender per-route:

```astro
---
export const prerender = true;  // built once, served as static HTML
---
```

The example ships with `@astrojs/node`, but `@tinacms/bridge` itself has zero Node.js dependencies — any adapter works:

| Runtime | Adapter |
|---------|---------|
| Node | `@astrojs/node` (default in this example) |
| Bun | `astro-bun` (community), or run `@astrojs/node`'s output via `bun run` (Bun's Node compat covers it) |
| Vercel / Netlify / Cloudflare | The matching `@astrojs/*` adapter |

Normal visitors hitting a server-rendered page get the same HTML they'd get from prerender, so add a CDN cache header (`Cache-Control: s-maxage=60`) on edit-able routes if you want edge caching for read traffic.

## What this example doesn't ship (yet)

- **TinaCloud overlay channel** — not needed; the stateless POST protocol works against any backend
- **Astro view transitions** for swap polish — possible follow-up
- **Live theme refresh without page reload** — would need theme to be its own island

## Known content-shape note

For nested MDX components in rich-text bodies (e.g. `<NewsletterSignup>` inside a post `_body`) to render via the Astro renderer instead of as raw HTML, the content needs to be authored through the Tina editor — which inserts them as MDX templates that Tina parses into `mdxJsxFlowElement` nodes. Hand-authored `<Component>` syntax in the markdown source is currently parsed as `html` by Tina's MDX layer; same behaviour as the React renderer.

## Differences from `astro/kitchen-sink`

| Concern | `astro/kitchen-sink` | `astro/visual-editing` (this) |
|---------|---------------------|------------------------------|
| Visual editing mechanism | React `useTina()` inside `client:tina` islands | Vanilla `@tinacms/bridge` + island refresh |
| React in the page tree | Yes (hydrated in editor only) | No |
| Production JS | ~0 KB outside editor | ~2 KB gzipped (bridge bails when not in iframe) |
| Astro output | `static` | `server` (with per-route prerender opt-in) |
| Rich-text renderer | `tinacms/dist/rich-text` (React) | `@tinacms/astro/TinaMarkdown.astro` (Astro) |
| Adapter | None (static) | `@astrojs/node` (or any) |

## Reference

- Bridge package: [`@tinacms/bridge`](../../../packages/@tinacms/bridge/) — postMessage handshake, click-to-focus, island refresh
- Bridge preview helper: [`@tinacms/bridge/preview`](../../../packages/@tinacms/bridge/src/preview.ts) — server-side `readOverlay(request, queryId)`
- Shared content contract: [examples/AGENTS.md](../../AGENTS.md)
- Cross-framework conventions: [root AGENTS.md](../../../AGENTS.md)
