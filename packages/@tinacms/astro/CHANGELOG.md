# @tinacms/astro

## 0.4.1

### Patch Changes

- [#7028](https://github.com/tinacms/tinacms/pull/7028) [`7b539b8`](https://github.com/tinacms/tinacms/commit/7b539b8e7d7d9f4451b5fd36a04d26b734f7d78e) Thanks [@JackDevAU](https://github.com/JackDevAU)! - Make the experimental island route work under the `@astrojs/cloudflare` adapter by supplying a valid `import.meta.url` to server bundles only. Adds a `cloudflareWorkers` option to force the workaround on or off.

## 0.4.0

### Minor Changes

- [#6969](https://github.com/tinacms/tinacms/pull/6969) [`2d572ad`](https://github.com/tinacms/tinacms/commit/2d572ad82f7770fe3026d68ed6f66115ac5aff62) Thanks [@kulesy](https://github.com/kulesy)! - Add official support for Astro 6. The `astro` peer dependency is now `^5.0.0 || ^6.0.0`, so Astro 5 consumers continue to work without changes. The package's own test suite and the `examples/astro/visual-editing` reference app (which consumes `@tinacms/astro`) have been bumped to Astro 6 to exercise the new version in CI. The `examples/astro/kitchen-sink` app has also been bumped to keep the kitchen-sink on a current Astro release, though it uses its own integration rather than `@tinacms/astro`.

## 0.3.0

### Minor Changes

- [#6843](https://github.com/tinacms/tinacms/pull/6843) [`0509095`](https://github.com/tinacms/tinacms/commit/0509095601fedc87f05a622e219e6414ef51a6b6) Thanks [@wicksipedia](https://github.com/wicksipedia)! - Support TinaCMS visual editing on statically-built Astro pages.

  Wrap editable regions in `<TinaIsland>` and visual editing now works under `output: 'static'` (and mixed static/SSR), provided the adapter can serve the one on-demand route `/tina-island/[name]`. Highlights:

  - **Static page support.** `<TinaIsland>` emits a tiny in-iframe bootstrap that fetches `/admin/bridge.js`; on init the bridge "primes" any page with island markers but no server-injected form payloads by calling the island endpoints, which now return the page's form payloads alongside region HTML.
  - **Bridge served as a static asset.** Dropped the injected `/_tina/bridge.js` route (some adapters 404'd it) in favour of serving `/admin/bridge.js` from a dev-only Vite plugin and emitting the bundle into the build client output — no source-tree writes. The `@tinacms/astro/bridge-route` subpath export is removed.
  - **Re-prime on soft navigation.** `refreshForms` now re-primes when it sees island markers without server-injected payloads, so Astro `ClientRouter` swaps work without a hard reload.
  - **Primary-form selection.** Mark the page's main form via `requestWithMetadata(..., { priority: 'primary' })` (SSR) or the `primary` prop on `<TinaIsland>` (static); the admin reducer routes around its default selection so multi-form pages no longer land on "Referenced Files".
  - **Prerender-safe middleware.** `tina()` now short-circuits on `context.isPrerendered`, fixing the `Astro.request.headers` warnings that fired on every prerendered route during `astro build`.
  - **New `tinaAdminDevRedirect` Vite plugin** at `@tinacms/astro/vite` — redirects `/admin` and `/admin/` to `/admin/index.html` during `astro dev` so a bare `/admin` request lands on the SPA.

### Patch Changes

- Updated dependencies [[`0509095`](https://github.com/tinacms/tinacms/commit/0509095601fedc87f05a622e219e6414ef51a6b6)]:
  - @tinacms/bridge@0.3.0

## 0.2.0

### Minor Changes

- [#6771](https://github.com/tinacms/tinacms/pull/6771) [`95758a0`](https://github.com/tinacms/tinacms/commit/95758a0ad31ec96aa652f247211a769e82a37cbb) Thanks [@wicksipedia](https://github.com/wicksipedia)! - ✨ **New package: `@tinacms/astro`** — the one-stop integration for using TinaCMS with Astro.

  ```bash
  pnpm add @tinacms/astro
  ```

  Bundles the rich-text renderer and re-exports the framework-agnostic bridge under one install. `@tinacms/bridge` stays publishable on its own for non-Astro frontends (coming soon); Astro projects only need `@tinacms/astro`.

  **What's exported**

  | Subpath                             | What it gives you                                                                                                                                                 |
  | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `@tinacms/astro`                    | `requestWithMetadata`, `tinaField`, `QueryResult`, and the rich-text types                                                                                        |
  | `@tinacms/astro/TinaMarkdown.astro` | `<TinaMarkdown content components />` — the rich-text renderer (import via subpath so Astro's check sees a real `.astro` component)                               |
  | `@tinacms/astro/integration`        | `tina()` integration — auto-wires the middleware and bridge route so `requestWithMetadata()` works without threading `Astro.request` or writing wiring components |
  | `@tinacms/astro/TinaIsland.astro`   | `<TinaIsland name wrapper params />` — marker wrapper for an editable region                                                                                      |
  | `@tinacms/astro/types`              | `TinaRichTextContent`, `CustomComponentsMap`, `TinaRichTextNode`, `MdxElement`, `TextElement`, etc.                                                               |
  | `@tinacms/astro/sanitize`           | `sanitizeHref` / `sanitizeImageSrc` for CMS-supplied URLs                                                                                                         |
  | `@tinacms/astro/bridge`             | `init`, `refreshForms`, and the rest of `@tinacms/bridge`                                                                                                         |
  | `@tinacms/astro/tina-field`         | `tinaField()` helper for `data-tina-field` markers                                                                                                                |
  | `@tinacms/astro/is-edit-mode`       | `isEditMode(request)` — server-side admin-iframe detection                                                                                                        |
  | `@tinacms/astro/experimental`       | `experimental_createIslandRoute()` — opt-in helper for the dynamic `/tina-island/[name]` endpoint                                                                 |

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

### Patch Changes

- Updated dependencies [[`95758a0`](https://github.com/tinacms/tinacms/commit/95758a0ad31ec96aa652f247211a769e82a37cbb)]:
  - @tinacms/bridge@0.2.0
