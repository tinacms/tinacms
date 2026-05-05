---
"@tinacms/astro": minor
---

✨ **New package: `@tinacms/astro`** — the one-stop integration for using TinaCMS with Astro.

```bash
pnpm add @tinacms/astro
```

Bundles the rich-text renderer and re-exports the framework-agnostic bridge under one install. `@tinacms/bridge` stays publishable on its own for non-Astro frontends (coming soon); Astro projects only need `@tinacms/astro`.

**What's exported**

| Subpath | What it gives you |
|---------|-------------------|
| `@tinacms/astro` | `TinaMarkdown` (default) — Astro rich-text renderer mirroring the React `TinaMarkdown` API |
| `@tinacms/astro/types` | `TinaRichTextContent`, `CustomComponentsMap`, `TinaRichTextNode`, `MdxElement`, `TextElement` |
| `@tinacms/astro/sanitize` | `sanitizeHref` / `sanitizeImageSrc` for CMS-supplied URLs |
| `@tinacms/astro/bridge` | `init` and the rest of `@tinacms/bridge` |
| `@tinacms/astro/tina-field` | `tinaField()` helper for `data-tina-field` markers |
| `@tinacms/astro/preview` | `readOverlay()` server helper for per-island refresh endpoints |

**Usage**

```astro
---
import TinaMarkdown from '@tinacms/astro';
import { tinaField } from '@tinacms/astro/tina-field';
import { customComponents } from '../components/markdown';
---
<div data-tina-field={tinaField(post.data.post, '_body')}>
  <TinaMarkdown content={post.data.post._body} components={customComponents} />
</div>

<script>
  import { init } from '@tinacms/astro/bridge';
  init();
</script>
```

The renderer mirrors the React `TinaMarkdown` from `tinacms/dist/rich-text` — same `content` prop, same `components` map shape — but emits pure HTML with no React in the page tree. Custom MDX components register by name (`mdxJsxFlowElement` / `mdxJsxTextElement`); default tags (`p`, `h1`, `a`, etc.) can be overridden by registering them on the same map.

**Peer deps**

- `astro >=5.0.0` — uses Astro's container API for testing and ships `.astro` source files for the consumer's Astro pipeline to compile.
