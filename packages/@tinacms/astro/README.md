# @tinacms/astro

The one-stop [TinaCMS](https://tina.io) integration for Astro. Ships:

- A vanilla-Astro **rich-text renderer** that mirrors the React `TinaMarkdown` API — same `content` prop, same `components` map shape, but emits pure HTML with no React in the page tree.
- The framework-agnostic **`@tinacms/bridge`** re-exported under `@tinacms/astro/bridge` so you only install one package.

> **Adopting in a new project?** Follow the step-by-step [GETTING_STARTED.md](./GETTING_STARTED.md) — covers install (incl. `@tinacms/cli`), integration wiring, data loaders, island registry, and troubleshooting. The rest of this README is the API reference.

## Install

```bash
pnpm add @tinacms/astro tinacms
pnpm add -D @tinacms/cli
```

Requires Astro 5. Also needs an SSR adapter (`@astrojs/node`, `vercel`, `netlify`, or `cloudflare`) and `output: 'server'` in your Astro config.

## Usage

Add the integration to `astro.config.mjs` once. It wires the request-scoped middleware and the dynamic route that serves the bridge — everything else is auto-injected only on edit-mode requests:

```ts
// astro.config.mjs
import { defineConfig } from 'astro/config';
import tina from '@tinacms/astro/integration';

export default defineConfig({
  integrations: [tina()],
});
```

Then load data the same way you would in any TinaCMS project — call the generated client, wrap the result with `requestWithMetadata()`:

```astro
---
import TinaMarkdown from '@tinacms/astro/TinaMarkdown.astro';
import { requestWithMetadata, tinaField } from '@tinacms/astro';
import client from '../tina/__generated__/client';

const post = await requestWithMetadata(
  client.queries.post({ relativePath: 'hello.md' }),
);
---
<article>
  <h1 data-tina-field={tinaField(post.data.post, 'title')}>
    {post.data.post.title}
  </h1>
  <div data-tina-field={tinaField(post.data.post, '_body')}>
    <TinaMarkdown content={post.data.post._body} />
  </div>
</article>
```

That's the whole user surface. No wiring component in your layout, no `forms` prop to maintain, no `Astro.request` to thread. The integration's middleware buffers each HTML response, and on edit-mode requests splices the form payloads and a `<script type="module" src="/_tina/bridge.js">` before `</head>`. Production visitors get **byte-identical HTML to a Tina-free Astro app** — no `data-tina-form` divs, no script tag, no bundle preload.

For cross-origin admin deployments (Codespaces, separate-domain self-hosted), set `PUBLIC_TINA_ADMIN_ORIGIN` in your env (comma-separate to allow multiple). The middleware embeds it inline so the bridge validates inbound `postMessage` events.

## Subpath exports

| Subpath | What it gives you |
|---------|-------------------|
| `@tinacms/astro` | `requestWithMetadata`, `tinaField`, `QueryResult`, and types |
| `@tinacms/astro/TinaMarkdown.astro` | `<TinaMarkdown content components />` — rich-text renderer. Import from this subpath so Astro's check sees a real `.astro` component (the bare-package default resolves through the types condition to a placeholder). |
| `@tinacms/astro/integration` | `tina()` integration — auto-wires middleware + bridge route so `requestWithMetadata()` works without you threading `Astro.request` or writing wiring components |
| `@tinacms/astro/TinaIsland.astro` | `<TinaIsland name wrapper params />` — marker wrapper for an editable region |
| `@tinacms/astro/types` | `TinaRichTextContent`, `CustomComponentsMap`, `TinaRichTextNode`, `MdxElement`, `TextElement` |
| `@tinacms/astro/sanitize` | `sanitizeHref` / `sanitizeImageSrc` for CMS-supplied URLs |
| `@tinacms/astro/bridge` | `init`, `refreshForms`, and the rest of `@tinacms/bridge` |
| `@tinacms/astro/tina-field` | `tinaField()` helper |
| `@tinacms/astro/is-edit-mode` | `isEditMode(request)` — server-side admin-iframe detection |
| `@tinacms/astro/middleware` | The middleware the integration auto-wires — exported here in case you need to compose it manually |
| `@tinacms/astro/experimental` | `experimental_createIslandRoute()` — opt-in helper built on Astro's unstable `experimental_AstroContainer` |

## Custom MDX components

Register Astro components against the names Tina uses for them in the editor:

```astro
---
import TinaMarkdown from '@tinacms/astro/TinaMarkdown.astro';
import type { CustomComponentsMap } from '@tinacms/astro/types';
import BlockQuote from '../components/BlockQuote.astro';
import NewsletterSignup from '../components/NewsletterSignup.astro';

const components: CustomComponentsMap = {
  BlockQuote,
  NewsletterSignup,
};
---
<TinaMarkdown content={post.data.post._body} components={components} />
```

The renderer dispatches `mdxJsxFlowElement` and `mdxJsxTextElement` nodes by `node.name`. Unknown names render a visible placeholder so you spot missing registrations during development.

## Default-tag overrides

The same `components` map can override the default HTML tag a node renders to. Useful for styling without forking the renderer:

```ts
const components: CustomComponentsMap = {
  p: Paragraph,        // Tailwind-styled <p>
  h1: Heading1,
  blockquote: BlockquoteTag,
  code_block: CodeBlock, // e.g. shiki-highlighted
  a: Anchor,
  img: Img,
};
```

Supported override keys: `p`, `h1`–`h6`, `ul`, `ol`, `li`, `blockquote`, `lic`, `a`, `img`, `code_block`, `hr`, `break`.

## Visual editing markers

The renderer doesn't emit `data-tina-field` attributes — wrap the call site to add them at whatever granularity makes sense:

```astro
---
import TinaMarkdown from '@tinacms/astro/TinaMarkdown.astro';
import { tinaField } from '@tinacms/astro/tina-field';
---
<div data-tina-field={tinaField(post.data.post, '_body')}>
  <TinaMarkdown content={post.data.post._body} components={components} />
</div>
```

Coarse-grained boundaries (the whole `_body`) are usually what you want — clicking any rich-text node focuses the editor on that field.

## Supported node types

| Type | Default rendering | Override key |
|------|-------------------|--------------|
| `p`, `h1`–`h6` | `<p>`, `<h1>`–`<h6>` | same |
| `ul`, `ol`, `li` | `<ul>`, `<ol>`, `<li>` | same |
| `blockquote` | `<blockquote>` | `blockquote` |
| `lic` | `<div>` | `lic` |
| `a` | `<a href={sanitized}>` | `a` |
| `img` | `<img src={sanitized}>` | `img` |
| `code_block` | `<pre><code class="language-…">` | `code_block` |
| `hr` | `<hr>` | `hr` |
| `break` | `<br>` | `break` |
| `text` (with `bold`/`italic`/`underline`/`strikethrough`/`code`/`highlight`) | nested `<strong>`/`<em>`/`<u>`/`<s>`/`<code>`/`<mark>` | n/a |
| `mdxJsxFlowElement`, `mdxJsxTextElement` | dispatched by `node.name` | n/a — register by name |
| `html`, `html_inline` | raw HTML via `set:html` | n/a |
| `invalid_markdown` | `<pre>{value}</pre>` | n/a |

CMS-supplied URLs in `a` and `img` nodes pass through `sanitizeHref` / `sanitizeImageSrc`, blocking `javascript:`, `data:`, `vbscript:`, and protocol-relative URLs. Both helpers are exposed on `@tinacms/astro/sanitize` for use in your own components (e.g. block-level Hero images, navigation anchors).

## Testing

Tests use Astro 5's [`experimental_AstroContainer`](https://docs.astro.build/en/reference/container-reference/). Fixtures are synced from `@tinacms/mdx`'s parser test corpus so renderer assertions track real editor output.

```bash
pnpm test
```

To pull a fresh fixture set after adding a new node type to `@tinacms/mdx`:

```bash
pnpm sync-fixtures
```

## License

Apache 2.0
