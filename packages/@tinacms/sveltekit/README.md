# `@tinacms/sveltekit`

TinaCMS visual editing for SvelteKit 3 and Svelte 5. `@tinacms/astro` is the
feature reference; the API follows SvelteKit and Svelte 5 conventions.

- **Usage:** [Setup](#setup) to [Deployment modes](#deployment-modes)
- **Development:** [Developing the package](#developing-the-package) and
  [Status and roadmap](#status-and-roadmap)

A working consumer lives in
[`examples/sveltekit/kitchen-sink`](../../../examples/sveltekit/kitchen-sink/README.md).

Why it works this way (decisions, trade-offs, lessons learned):
[DESIGN.md](./DESIGN.md).

## Requirements

- SvelteKit `^3.0.0`, Svelte `^5.57.1`, Vite 8, TypeScript 6, Node 22.17+
- `tinacms` and `@tinacms/cli` configured in the app's `tina/` folder

## How it works

During `pnpm dev`, Tina's CLI runs a local GraphQL server and wraps the Vite
dev server (`tinacms dev -c "vite dev"`). The Tina admin loads your site in an
iframe:

1. `tinaHandle` (server hook) detects editor-iframe requests, collects every
   Tina form queried during the render, and injects the form payloads into
   the HTML stream (as `<template>` elements, which are valid in `<head>`).
2. `TinaBridge` (root layout, **required**) starts the bridge only inside the
   iframe, after hydration, and refreshes forms after client-side navigation.
   The hook deliberately injects no bridge script: one that runs before Svelte
   hydrates changes the DOM and causes a hydration mismatch.
3. `useTina()` (built on `subscribeToTinaData`) delivers unsaved sidebar edits
   (`updateData` messages) to the page, so it re-renders without reloading.
4. `tinaField()` adds `data-tina-field` attributes so clicking an element
   focuses its field in the sidebar.

Ordinary visitors get no form payloads and never load the bridge.

## Setup

```sh
pnpm add tinacms @tinacms/sveltekit
pnpm add -D @tinacms/cli
```

Register the Vite plugin. It serves `/admin/bridge.js` in development and emits
it into the client build; it never writes into `static/`.

```ts
// vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite';
import { tinaVitePlugin } from '@tinacms/sveltekit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit(), tinaVitePlugin()],
});
```

Compose the hook. If the app already has `handle` hooks, put `tinaHandle` in
the same `sequence(...)`; every hook must call `resolve(event)`.

```ts
// src/hooks.server.ts
import { sequence } from '@sveltejs/kit/hooks';
import { tinaHandle } from '@tinacms/sveltekit/hooks';

export const handle = sequence(tinaHandle);
```

Mount the bridge once in the root layout:

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import TinaBridge from '@tinacms/sveltekit/TinaBridge.svelte';

  let { children } = $props();
</script>

<TinaBridge />
{@render children()}
```

Scripts: `"dev": "tinacms dev -c \"vite dev\""`. For production builds that
prerender Tina content, run Vite *inside* the CLI so the local GraphQL server
stays up: `tinacms build --local --skip-cloud-checks -c "vite build"`. Running
`tinacms build && vite build` does not work; Tina exits before SvelteKit
prerenders.

## Load and render data

Wrap each generated query in a server `load` with `requestWithMetadata()`. The
event lets it apply the iframe's unsaved overlay and register the form.

```ts
// src/routes/posts/[...slug]/+page.server.ts
import { error } from '@sveltejs/kit';
import { requestWithMetadata } from '@tinacms/sveltekit/data';
import client from '../../../../tina/__generated__/client';

export const load = async (event) => {
  const postQuery = await requestWithMetadata(
    client.queries.post({ relativePath: `${event.params.slug}.md` }),
    event,
    { priority: 'primary' }
  );
  if (!postQuery.data.post) error(404, 'Post not found');
  return { postQuery };
};
```

`requestWithMetadata()` never throws. If the query fails (for example, the
document doesn't exist) it logs a warning and returns empty data, so check the
data yourself and return a 404, as above. A `try/catch` around it never fires.

In the page, get live data with `useTina()` and mark editable elements:

```svelte
<script lang="ts">
  import { tinaField } from '@tinacms/sveltekit';
  import { useTina } from '@tinacms/sveltekit/use-tina';
  import TinaMarkdown from '@tinacms/sveltekit/TinaMarkdown.svelte';

  let { data } = $props();
  const tina = useTina(() => data.postQuery);
  const post = $derived(tina.data.post);
</script>

<h1 data-tina-field={tinaField(post, 'title')}>{post.title}</h1>
<div data-tina-field={tinaField(post, 'body')}>
  <TinaMarkdown content={post.body} />
</div>
```

### Why `useTina` exists

Without it, every page that shows Tina data repeats the same ~10 lines:

```ts
let preview = $state<{ id: string; data: any }>();
$effect(() => {
  const query = data.postQuery;
  return subscribeToTinaData(query, (updated) => {
    preview = { id: query.id, data: updated };
  });
});
const post = $derived(
  (preview?.id === data.postQuery.id ? preview.data : data.postQuery.data).post
);
```

Two parts of it are easy to get wrong when copied by hand:

- **The `id` check.** SvelteKit reuses the page component when you navigate
  between two posts. Without comparing ids, the new post briefly shows the
  previous post's unsaved data.
- **Reading `query` inside the `$effect`.** That's what makes the
  subscription restart for the new page's form after navigation.

`useTina()` keeps both in one tested place (`src/use-tina.svelte.ts`, covered
by `use-tina.svelte.test.ts`). It's the SvelteKit counterpart of `useTina` in
`tinacms/dist/react`, so the call looks familiar to Tina users.

### Rules and downsides

- **Pass a getter, `useTina(() => data.postQuery)`, not the value.** Passing
  `data.postQuery` reads it once, and the page stops following navigation.
  This is the most common mistake, and TypeScript catches it because the
  parameter is a function.
- **Call it at component setup**, at the top level of `<script>`. It creates an
  `$effect`, so it can't be called inside an event handler or a plain `.ts`
  module.
- **Read `tina.data`; don't destructure it.** `const { data } = useTina(...)`
  copies the value once and loses reactivity. Use `$derived(tina.data.post)`.
- **It ships as source, not compiled JS.** Runes only work after the Svelte
  compiler runs, so `./use-tina` points at `src/use-tina.svelte.ts`, like the
  `.svelte` components. The consuming app's Vite and Svelte plugin compile it,
  which every SvelteKit app does anyway. Tools that read only `dist/` won't see
  it.
- **It's one more API to keep stable.** `subscribeToTinaData()` stays public
  for code outside Svelte components.
- **No extra behavior.** It doesn't load data, register forms or handle
  click-to-focus. Those stay with `requestWithMetadata`, `tinaHandle` and
  `TinaBridge`. Outside the Tina iframe the subscription does nothing, and
  `tina.data` is just the server data.

## Rich text: `TinaMarkdown`

Renders Tina rich-text and lets you override any node through `components`:

| Node / key | Default output | Override props |
|---|---|---|
| `p`, `h1`–`h6`, `ul`, `ol`, `li`, `blockquote` | Matching element | `children` snippet |
| `lic` | `<div>` | `children` snippet |
| `a` | Sanitized `<a href>` | `url`, `children` |
| `img` | Sanitized `<img src>` | `url`, `alt`, `caption` |
| `code_block` | `<pre><code class="language-…">` | `value`, `lang` |
| `table`, `tr`, `th`, `td` | HTML table (native and legacy MDX shapes) | `children`; cells get `align` |
| `hr`, `break` | `<hr>`, `<br>` | none |
| `html`, `html_inline` | Escaped text | `value` |
| MDX template name, e.g. `Callout` | Missing-component label | The template's props |

- Text marks (`bold`, `italic`, `underline`, `strikethrough`, `code`,
  `highlight`, text colour) render as semantic HTML; colours that aren't a
  plain CSS colour are dropped. Leaves are recognised by `type: 'text'`
  *or* by a string `text` field, because the editor sends newly typed text as
  `{ text }` without a type.
- Shortcode templates declare `match: { start: '{{%', name: 'pull-quote', end: '%}}' }`
  in the schema and are keyed by template name in `components`.
- Default nodes render as plain HTML with no classes or styles, like Tina's
  React and Astro renderers. Style them from a wrapper (for example a `prose`
  class); code blocks keep a `language-*` class for syntax highlighters.
- Link and image URLs are sanitized. Never pass CMS HTML to `{@html}`.
- Syntax highlighting is up to the app: install Shiki yourself and pass a
  `code_block` override that renders Shiki's output.

## Prerendered pages (experimental islands)

`adapter-static` has no runtime server, so it can't refresh content. With a
server-capable adapter (e.g. `adapter-node`), pages can be prerendered and
still edit live: `TinaIsland` marks a region, and the bridge re-renders it
through an endpoint with the unsaved overlay.

```ts
// src/routes/tina-island/[name]/+server.ts
import { experimental_createIslandHandler } from '@tinacms/sveltekit/experimental';
import { requestWithMetadata } from '@tinacms/sveltekit/data';
import PostView from '#lib/components/PostView.svelte';
import client from '#tina/__generated__/client.ts';

export const POST = experimental_createIslandHandler({
  post: {
    component: PostView,
    wrapper: { tag: 'article', className: 'prose' },
    fetch: async (event, params) => {
      const slug = params.get('slug');
      if (!slug) throw new Error('Missing post slug');
      return requestWithMetadata(
        client.queries.post({ relativePath: `${slug}.md` }),
        event,
        { priority: 'primary' }
      );
    },
    propsFromData: (data) => ({ post: data }),
  },
});
```

```svelte
<TinaIsland name="post" wrapper={{ tag: 'article', className: 'prose' }}
  params={{ slug: data.slug }} primary>
  <PostView post={data.post} />
</TinaIsland>
```

- The registry key, `name`, and `wrapper` must match. Pass `basePath` if the
  app uses a SvelteKit base path.
- The endpoint accepts only same-origin Tina preview POSTs, bounds and
  validates the JSON envelope, renders only registered components, and sends
  `Cache-Control: no-store`. Never choose components from request input.

## Deployment modes

| Deployment | Live editing |
|---|---|
| Server adapter, SSR pages | Yes, through `tinaHandle` |
| Server adapter, prerendered pages + island endpoint | Yes (experimental) |
| `adapter-static`, files only | No; build without the admin and bridge |

Notes: editor-mode HTML is injected with `transformPageChunk` (streamed, not
buffered) and `content-length` is dropped only for that HTML. `tinaHandle`
can't touch pages already served as static files. A Tina admin on a separate
origin isn't supported yet.

## Developing the package

From the monorepo root:

```sh
pnpm install
pnpm --filter @tinacms/sveltekit test          # svelte-check, then Vitest (Node and happy-dom projects)
pnpm --filter @tinacms/sveltekit check         # svelte-check only (.svelte and .svelte.ts files)
pnpm --filter @tinacms/sveltekit types
pnpm --filter @tinacms/sveltekit build
```

Before packing or publishing, run `build` and **then** `types`. `build` writes
placeholder `dist/*.d.ts` files (`export * from "../src/…"`) so dev mode can
skip TypeScript. `types` replaces them with real declarations. A tarball packed
after `build` alone makes consumers type-check this package's source with their
own tsconfig, which fails (for example, without `@types/node`). Turbo's `types`
task already runs after `build`.

The `.svelte` components and `use-tina.svelte.ts` ship as source and are
compiled by the consuming app. Tests are excluded from the tarball
(`"!src/__tests__"` in `files`).

Layout:

| Path | Purpose |
|---|---|
| `src/hooks.ts` | `tinaHandle`: form collection and HTML injection |
| `src/data.ts` | `requestWithMetadata`, `subscribeToTinaData` |
| `src/use-tina.svelte.ts` | `useTina()`: live data for components (shipped as source) |
| `src/vite.ts` | `tinaVitePlugin`: bridge in dev and build |
| `src/TinaBridge.svelte` | Iframe bootstrap and navigation refresh |
| `src/TinaMarkdown.svelte` | Rich-text renderer |
| `src/TinaIsland.svelte`, `src/experimental/` | Island marker and endpoint |
| `src/internal/` | Per-request form store (on `event.locals`), escaping |
| `src/__tests__/` | `*.test.ts` (Node), `*.svelte.test.ts` (happy-dom, can use runes) |

Design decisions:

- Form state lives on `event.locals`, not `AsyncLocalStorage`, so the request
  path stays edge-compatible.
- Use Svelte 5 runes for all components.
- The bridge is served by Vite middleware in dev and emitted only into the
  client build. Putting it in `static/admin` makes Vite reject the import.
- No item counts as done from compilation alone; runtime behavior needs a
  check in the example app.

Working in WSL without a browser: reproduce renderer bugs with a
`*.svelte.test.ts` (happy-dom; hold props in `$state`, change them and call
`flushSync()` to replay editor updates),
check the dev server with `curl -s localhost:5173/<path> | grep data-tina`, and
leave visual checks in the Tina admin to a human. Don't read
`tina/__generated__/` files whole; grep for what you need.

## Status and roadmap

Verified:
- Dev iframe flow: field focus, live unsaved edits, navigation between
  posts, and plain visitor responses with no editor payload.
- Both example builds (Node hybrid and static) complete.
- Hybrid runtime (2026-10-19, Playwright): a prerendered post primes its island
  (200), its form appears in the admin, and unsaved edits update the preview.
  Dev: live title and rich text, click-to-focus, navigation, no console
  warnings. Same-origin checks need the server to see the browser's protocol;
  see the example README on `pnpm start` over plain HTTP.
- `pnpm test` passes (23 tests in Node and happy-dom, plus `svelte-check`),
  and so does the example's Playwright suite (53 tests). CI runs both.

Next:
1. **Publishing:** done for a local tarball: installed in a standalone
   SvelteKit 3 app, its build prerenders every component and `useTina`, and
   `svelte-check` passes. Still to do: a changeset and the real npm release.
2. **Content invalidation:** check whether Vite needs a watcher for content
   and routes created in Tina during dev.
3. **Shared server helpers:** move edit-mode detection, form payloads,
   escaping, the island checks and the bridge dev server into
   `@tinacms/bridge`, and switch this package and `@tinacms/astro` to them
   (follow-up PR).
4. **happy-dom:** this package pins `happy-dom ^21.0.4`: 15.10.2 (the catalog
   version) doesn't show paragraphs added to existing content, and versions up
   to 21.0.3 are covered by security advisories. Go back to `catalog:` once
   the catalog is bumped.

References: [Tina Astro visual editing](https://tina.io/docs/contextual-editing/astro),
[SvelteKit adapters](https://svelte.dev/docs/kit/adapters),
[page options](https://svelte.dev/docs/kit/page-options),
[svelte/server](https://svelte.dev/docs/svelte/svelte-server).
