# @tinacms/astro

## 0.6.1

### Patch Changes

- [#7213](https://github.com/tinacms/tinacms/pull/7213) [`056ffc2`](https://github.com/tinacms/tinacms/commit/056ffc22dc87b0040281054f4140c6260c22ea1f) Thanks [@wicksipedia](https://github.com/wicksipedia)! - Publish internal package references as ranges instead of exact versions.

  Internal dependencies were declared as `workspace:*`, which pnpm expands to an **exact version** when publishing (`"tinacms": "3.10.0"`), not a range. An exact pin cannot deduplicate against the version a consumer has already installed, so npm nests a second — and third — complete copy of `tinacms` and its dependency tree. In a stock Astro + TinaCMS blog this produced three copies of `tinacms`, three of `mermaid` (186 MB), five of `date-fns` (151 MB), and four of `typescript` (88 MB): about **320 MB of duplication**.

  The same expansion applied to `peerDependencies`, so packages such as `next-tinacms-cloudinary` and `tinacms-authjs` published `"tinacms": "3.10.0"` as a _peer_ — requiring consumers to have that exact version or hit an `ERESOLVE` conflict, and forcing a republish of every dependent on each `tinacms` release.

  Switching these to `workspace:^` publishes them as caret ranges (`^3.10.0`), which deduplicate normally and let `onlyUpdatePeerDependentsWhenOutOfRange` do its job.

- Updated dependencies [[`cdbf469`](https://github.com/tinacms/tinacms/commit/cdbf469d96d8a3bcf5d3096d53907a06eaaed7f2)]:
  - @tinacms/bridge@0.3.1

## 0.6.0

### Minor Changes

- [#7163](https://github.com/tinacms/tinacms/pull/7163) [`c2c03c6`](https://github.com/tinacms/tinacms/commit/c2c03c677f67b6fd3a2155d5227b9bf785b43288) Thanks [@kulesy](https://github.com/kulesy)! - Add official support for Astro 7. The `astro` peer dependency is now `^5.0.0 || ^6.0.0 || ^7.0.0`, so Astro 5 and 6 consumers continue to work without changes. The package's own test suite and the `examples/astro/visual-editing` reference app (which consumes `@tinacms/astro`) have been bumped to Astro 7 to exercise the new version in CI. The `examples/astro/kitchen-sink` app stays on Astro 6 for now, since moving it to Astro 7 (Vite 8) needs a separate Tailwind PostCSS-to-Vite-plugin migration and it uses its own integration rather than `@tinacms/astro`.

## 0.5.1

### Patch Changes

- [#7069](https://github.com/tinacms/tinacms/pull/7069) [`2676b78`](https://github.com/tinacms/tinacms/commit/2676b7825873959f8feb4fa7e3eee1de9450b06d) Thanks [@kulesy](https://github.com/kulesy)! - Re-run `getStaticPaths` in dev when Tina writes or deletes a content file, so newly created entries no longer 404 until the dev server is restarted by hand. Applies to Astro 6+, whose dev runtime handles the `astro:content-changed` signal; Astro 5 is left untouched.

- [#7088](https://github.com/tinacms/tinacms/pull/7088) [`d44558e`](https://github.com/tinacms/tinacms/commit/d44558e9b4502d4f4fc2c970d22985339fe2b6ce) Thanks [@Aibono1225](https://github.com/Aibono1225)! - Fix media upload/delete paths to prevent access to storage keys outside mediaRoot.

- Updated dependencies []:
  - @tinacms/bridge@0.3.0

## 0.5.0

### Minor Changes

- [#7041](https://github.com/tinacms/tinacms/pull/7041) [`5ec75e6`](https://github.com/tinacms/tinacms/commit/5ec75e64239ec28cd7eb46c78d67a947051bfda9) Thanks [@JackDevAU](https://github.com/JackDevAU)! - feat: add astro table to tinamarkdown

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
