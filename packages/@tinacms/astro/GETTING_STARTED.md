# Getting started — `@tinacms/astro`

Step-by-step for adding TinaCMS visual editing to a new or existing Astro project. Tested against Astro 5, 6, and 7, Node 18+, TinaCMS 3.

The reference implementation lives at [`examples/astro/visual-editing`](../../../examples/astro/visual-editing/) — same content schema as the React kitchen-sink, rendered with pure Astro.

## 1. Install

```bash
pnpm add @tinacms/astro tinacms
pnpm add -D @tinacms/cli
```

You'll also need an Astro SSR adapter — the island-refresh endpoint (`/tina-island/[name]`) renders at request time:

```bash
pnpm add @astrojs/node          # or @astrojs/vercel / netlify / cloudflare
```

This guide uses `output: 'server'` (the simplest setup). `output: 'static'` also works for visual editing — see [Static-site editing](#static-site-editing) at the end — as long as your editable regions are wrapped in `<TinaIsland>` (steps 5–7) and the adapter can serve that one on-demand island route.

If your collections use MDX bodies:

```bash
pnpm add @astrojs/mdx
```

If you're running self-hosted (no TinaCloud), add the datalayer:

```bash
pnpm add @tinacms/datalayer
```

## 2. Scaffold Tina

If you don't have a `tina/` directory yet:

```bash
pnpm tinacms init
```

This generates `tina/config.tsx`, an example collection, and the `tina/__generated__/` folder (GraphQL client, types, schema). You can also copy `tina/` from the reference example and adjust.

## 3. Wire the integration

`astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';
import tina from '@tinacms/astro/integration';
import node from '@astrojs/node';
import mdx from '@astrojs/mdx';

export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [mdx(), tina()],
});
```

That single `tina()` call auto-injects the middleware (resolves `Astro.locals.tinaEdit`, splices the bridge wiring on edit-mode responses) and stages the vanilla-JS bridge as a static file at `/admin/bridge.js` (next to the admin UI, so it ships on every deploy regardless of `output`). Production HTML stays byte-identical to a Tina-free Astro app.

## 4. Data loaders — wrap every query with `requestWithMetadata`

`src/lib/data.ts`:

```ts
import { requestWithMetadata } from '@tinacms/astro';
import client from '../../tina/__generated__/client';

export const getPage = (slug: string) =>
  requestWithMetadata(client.queries.page({ relativePath: `${slug}.md` }));

export const getPost = (slug: string) =>
  requestWithMetadata(client.queries.post({ relativePath: `${slug}.md` }));

// ...one per collection
```

`requestWithMetadata` stamps the result with the metadata `tinaField()` needs for click-to-focus, derives the form id the bridge uses to address the form, and in edit mode swaps `data` for the unsaved overlay automatically.

## 5. Island registry — one entry per editable region

`src/lib/islands.ts`:

```ts
import type { IslandRegistry } from '@tinacms/astro/experimental';
import PostBody from '../components/PostBody.astro';
import { getPost } from './data';

const ARTICLE_WRAPPER = { tag: 'article', className: 'max-w-3xl mx-auto' };

export const islands: IslandRegistry = {
  post: {
    fetch: (_request, params) => getPost(params.get('slug') ?? ''),
    component: PostBody,
    wrapper: ARTICLE_WRAPPER,
    propsFromData: (data) => ({
      data: (data as { data?: { post?: unknown } }).data?.post,
    }),
  },
};
```

## 6. Dynamic island endpoint — one file, fully generic

`src/pages/tina-island/[name].ts`:

```ts
import type { APIRoute } from 'astro';
import { experimental_createIslandRoute } from '@tinacms/astro/experimental';
import { islands } from '../../lib/islands';

export const prerender = false;
export const ALL: APIRoute = experimental_createIslandRoute(islands);
```

That's the only file the bridge needs. Adding a new editable region from here on is one entry in the registry.

## 7. Use editable regions in pages

`src/pages/posts/[...urlSegments].astro`:

```astro
---
import TinaIsland from '@tinacms/astro/TinaIsland.astro';
import PostBody from '../../components/PostBody.astro';
import { getPost } from '../../lib/data';
import { islands } from '../../lib/islands';

const slug = (Astro.params.urlSegments ?? '').toString();
const post = await getPost(slug);
if (!post.data?.post) {
  return new Response('Not Found', { status: 404 });
}
const data = post.data.post;
---
<TinaIsland name="post" wrapper={islands.post.wrapper} params={{ slug }} primary>
  <PostBody data={data} />
</TinaIsland>
```

The `primary` prop marks this as the page's main editable region: the editor opens this form on load rather than landing on the "Referenced Files" list when the page also registers e.g. a global-config form. On `output: 'server'` pages it's optional (the first `requestWithMetadata()` call — the page's own — is treated as primary automatically); on `output: 'static'` pages it's how the bridge knows which island is "the page", so set it there. Mark at most one `<TinaIsland>` per page.

Inside `PostBody.astro`, add `data-tina-field={tinaField(data, 'fieldName')}` to whatever you want click-to-focus on, and use `TinaMarkdown` for rich-text bodies:

```astro
---
import TinaMarkdown from '@tinacms/astro/TinaMarkdown.astro';
import { tinaField } from '@tinacms/astro/tina-field';
import type { PostQuery } from '../../tina/__generated__/types';

interface Props { data: NonNullable<PostQuery['post']>; }
const { data } = Astro.props;
---
<h1 data-tina-field={tinaField(data, 'title')}>{data.title}</h1>
<div data-tina-field={tinaField(data, '_body')}>
  <TinaMarkdown content={data._body} />
</div>
```

> **Note:** Import `TinaMarkdown` from the `/TinaMarkdown.astro` subpath, not from the bare `@tinacms/astro` default. Astro's type-checker reads the `.astro` file directly via that subpath; the bare-package default resolves through the `types` condition to a placeholder that Astro doesn't recognise as a renderable component.

## 8. Optional — cross-origin admin

If your admin is on a different origin (Codespaces, separate-domain self-hosted), set in your `.env`:

```
PUBLIC_TINA_ADMIN_ORIGIN=https://admin.example.com
```

The middleware embeds it inline so the bridge validates inbound postMessages. Comma-separate to allow multiple (preview + prod).

## 9. Add the dev/build scripts

`package.json`:

```json
{
  "scripts": {
    "dev": "tinacms dev -c \"astro dev\"",
    "build": "tinacms build && astro build",
    "build:local": "tinacms build --local --skip-cloud-checks -c \"astro build\""
  }
}
```

`build:local` is useful in CI / offline development — it indexes content locally without contacting TinaCloud.

## 10. Run

```bash
pnpm dev
# Site:  http://localhost:4321/
# Admin: http://localhost:4321/admin/
```

Open `/admin/`, click into a doc, edit a field. The iframe re-fetches only the affected island and swaps it into the DOM — no full reload, no React in your page tree.

## TypeScript niceties

For the cleanest type-check experience:

- Annotate route data with the generated query types (`PostQuery['post']`, `PageQuery['page']`, etc.) so casts disappear.
- Guard with `if (!result.data?.X) return new Response('Not Found', { status: 404 });` — the inferred `data` after the guard is non-null and fully typed.
- The Tina admin schemas in `tina/collections/`, `tina/schemas/`, `tina/fields/` use literal-typed Field unions that strict `astro check` finds painful. Excluding those folders in `tsconfig.json` keeps `astro check` focused on UI code — Tina's CLI validates schemas separately:

```json
{
  "exclude": [
    "node_modules",
    "dist",
    "tina/__generated__",
    "tina/collections",
    "tina/schemas",
    "tina/fields",
    "tina/config.tsx",
    "tina/database.ts"
  ]
}
```

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Iframe shows page but admin sidebar stays empty | `Sec-Fetch-Dest: iframe` lost on in-iframe link clicks | The `__tina_edit` cookie handles this automatically. If still broken, check DevTools → Application → Cookies for `__tina_edit=1` on the iframe origin. |
| "Tina Dev server is already in use. Datalayer server is busy on port 9000" | Another `pnpm dev` is running | Kill it, or set a different datalayer port |
| Admin URL bar updates but new page's forms don't appear | Bridge isn't loading on the new page | Inspect the new page's `<head>` in DevTools — should contain `<div data-tina-form="…" hidden>` and a `<script type="module">` importing `/admin/bridge.js`. If they're missing, edit-mode detection failed (check the Referer header on the request). |
| Visual editing dead on a deployed site, no `data-tina-form` / `bridge.js` in the HTML | Pages are statically built (`output: 'static'`) so the middleware never runs at request time | Either set `output: 'server'`, or wrap editable regions in `<TinaIsland>` (steps 5–7) — see [Static-site editing](#static-site-editing). Without an `<TinaIsland>` somewhere on the page there's nothing to inject the bridge on a static build. |
| `Type 'X' is not assignable to type 'never'` on `<TinaMarkdown>` | Imported from bare `@tinacms/astro` (which resolves to the placeholder type) | Import from `@tinacms/astro/TinaMarkdown.astro` instead |

## Static-site editing

You can keep `output: 'static'` (pages prerendered, served as flat files) and still edit visually. The middleware only injects the bridge on on-demand-rendered responses, so on a static page that doesn't happen — instead, **`<TinaIsland>` emits a tiny inline `<script>`** that loads `/admin/bridge.js` only when the page is open inside the admin iframe. On boot the bridge fetches each island's `/tina-island/[name]` endpoint (still `prerender = false`, so the adapter renders it on demand) to pick up the page's form payloads, and from there editing behaves exactly as in an SSR project.

To make it work:

- Wrap every editable region in `<TinaIsland>` with a registered island (steps 5–7). This is required for static editing — it's both how regions re-render and how the bridge gets bootstrapped.
- Mark the page's main region `primary` (`<TinaIsland … primary>`). On a static page the bridge can't otherwise tell which island is "the page", so without this the editor may land on the "Referenced Files" list. One per page.
- Keep `export const prerender = false` on `src/pages/tina-island/[name].ts`.
- You still need an SSR adapter; just leave `output` as `'static'` (or set `prerender = false` on only the page routes you want server-rendered).

Trade-off: a page that uses `<TinaIsland>` ships that one-line inline bootstrap in production HTML — it's no longer byte-identical to a Tina-free Astro app. Pages without `<TinaIsland>` are unchanged.

## Reference

- Full example: [`examples/astro/visual-editing`](../../../examples/astro/visual-editing/) — every pattern in this guide, plus listing pages, layout/header/footer islands, and 5 custom MDX components
- Package README: [`README.md`](./README.md) — subpath exports, custom MDX patterns, default-tag overrides
- Bridge package: [`@tinacms/bridge`](../../@tinacms/bridge/) — the vanilla-JS bridge underneath; usable from Hugo, plain HTML, anything non-React
