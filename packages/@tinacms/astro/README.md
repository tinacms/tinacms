# @tinacms/astro

The one-stop [TinaCMS](https://tina.io) integration for Astro. Ships:

- A vanilla-Astro **rich-text renderer** that mirrors the React `TinaMarkdown` API — same `content` prop, same `components` map shape, but emits pure HTML with no React in the page tree.
- The framework-agnostic **`@tinacms/bridge`** re-exported under `@tinacms/astro/bridge` so you only install one package.

## Install

```bash
pnpm add @tinacms/astro
```

Requires Astro 5.

## Usage

```astro
---
import TinaMarkdown from '@tinacms/astro';
import { tinaField } from '@tinacms/astro/tina-field';

const post = await client.queries.post({ relativePath: 'hello.md' });
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

Wire the bridge in your base layout to enable click-to-focus and live preview:

```astro
<head>
  <script type="application/tina+json" set:html={JSON.stringify(form)} />
  <script>
    import { init } from '@tinacms/astro/bridge';
    init();
  </script>
</head>
```

## Subpath exports

| Subpath | What it gives you |
|---------|-------------------|
| `@tinacms/astro` | `TinaMarkdown` (default) |
| `@tinacms/astro/types` | `TinaRichTextContent`, `CustomComponentsMap`, `TinaRichTextNode`, `MdxElement`, `TextElement` |
| `@tinacms/astro/sanitize` | `sanitizeHref` / `sanitizeImageSrc` for CMS-supplied URLs |
| `@tinacms/astro/bridge` | `init` and the rest of `@tinacms/bridge` |
| `@tinacms/astro/tina-field` | `tinaField()` helper |
| `@tinacms/astro/preview` | `readOverlay()` server helper for island refresh endpoints |

## Custom MDX components

Register Astro components against the names Tina uses for them in the editor:

```astro
---
import TinaMarkdown from '@tinacms/astro';
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
import { tinaField } from '@tinacms/astro/tina-field';
import TinaMarkdown from '@tinacms/astro';
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
