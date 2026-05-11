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
| `@tinacms/astro` | `requestWithMetadata`, `tinaField`, `QueryResult`, and the rich-text types |
| `@tinacms/astro/TinaMarkdown.astro` | `<TinaMarkdown content components />` — the rich-text renderer (import via subpath so Astro's check sees a real `.astro` component) |
| `@tinacms/astro/integration` | `tina()` integration — auto-wires the middleware and bridge route so `requestWithMetadata()` works without threading `Astro.request` or writing wiring components |
| `@tinacms/astro/TinaIsland.astro` | `<TinaIsland name wrapper params />` — marker wrapper for an editable region |
| `@tinacms/astro/types` | `TinaRichTextContent`, `CustomComponentsMap`, `TinaRichTextNode`, `MdxElement`, `TextElement`, etc. |
| `@tinacms/astro/sanitize` | `sanitizeHref` / `sanitizeImageSrc` for CMS-supplied URLs |
| `@tinacms/astro/bridge` | `init`, `refreshForms`, and the rest of `@tinacms/bridge` |
| `@tinacms/astro/tina-field` | `tinaField()` helper for `data-tina-field` markers |
| `@tinacms/astro/is-edit-mode` | `isEditMode(request)` — server-side admin-iframe detection |
| `@tinacms/astro/experimental` | `experimental_createIslandRoute()` — opt-in helper for the dynamic `/tina-island/[name]` endpoint |

**Usage**

```astro
---
import TinaMarkdown from '@tinacms/astro/TinaMarkdown.astro';
import { requestWithMetadata, tinaField } from '@tinacms/astro';
import client from '../tina/__generated__/client';
import { customComponents } from '../components/markdown';

const post = await requestWithMetadata(
  client.queries.post({ relativePath: 'hello.md' }),
);
---
<div data-tina-field={tinaField(post.data.post, '_body')}>
  <TinaMarkdown content={post.data.post._body} components={customComponents} />
</div>
```

Add `tina()` from `@tinacms/astro/integration` to your `astro.config.mjs` and the middleware auto-injects the bridge script + per-form payloads on edit-mode requests. Production HTML is byte-identical to a Tina-free Astro app.

The renderer mirrors the React `TinaMarkdown` from `tinacms/dist/rich-text` — same `content` prop, same `components` map shape — but emits pure HTML with no React in the page tree. Custom MDX components register by name (`mdxJsxFlowElement` / `mdxJsxTextElement`); default tags (`p`, `h1`, `a`, etc.) can be overridden by registering them on the same map.

**Peer deps**

- `astro >=5.0.0` — uses Astro's container API for islands and ships `.astro` source files for the consumer's Astro pipeline to compile.
