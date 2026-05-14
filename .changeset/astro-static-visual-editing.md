---
"@tinacms/astro": minor
"@tinacms/bridge": minor
---

Support TinaCMS visual editing on statically-built Astro pages

Visual editing previously required `output: 'server'` — the `tina()` middleware only injects the bridge bootstrap and form payloads on on-demand-rendered responses, so a prerendered page in the admin iframe stayed inert. This release makes visual editing work with `output: 'static'` (or `static` with selective `prerender = false`): wrap editable regions in `<TinaIsland>` and the editor connects, provided the adapter can serve the one remaining on-demand route (`/tina-island/[name]`).

**Static page support.** `<TinaIsland>` now emits a tiny in-iframe bootstrap `<script>` — a no-op for normal visitors, it only fetches `/admin/bridge.js` when the page is inside the admin iframe. On init, the bridge "primes" any page that has `[data-tina-island]` markers but no server-injected `[data-tina-form]` payloads by fetching the island endpoints, which now return the page's form payloads alongside the region HTML. The island route runs its render inside the request/forms scopes so the editor's overlay is applied on refetch. Pages using `<TinaIsland>` now carry a ~one-line inline bootstrap script, so their production HTML is no longer byte-identical to a Tina-free Astro app; pages without `<TinaIsland>` are unchanged, and SSR projects are unaffected.

**Bridge shipped as a static asset.** The bridge bundle is now staged into `public/admin/bridge.js` by the integration, rather than served by an injected `/_tina/bridge.js` route — some adapters (e.g. `@astrojs/vercel` in `output: 'static'`) don't give injected on-demand routes a Build Output entry and 404'd it. The `@tinacms/astro/bridge-route` subpath export is removed.

**Re-prime on soft navigation.** `refreshForms` now performs the same prime-then-rescan when it sees island markers without server-injected payloads, so ClientRouter swaps work too — previously only the first page connected and subsequent navigations left the admin sidebar empty until a hard reload.

**Primary-form selection.** When a page registers more than one form (typically the page document plus a layout-level global), the admin could land on the multi-document "Referenced Files" list instead of the page's form. Two opt-in ways to mark the page's main form:

- `requestWithMetadata()` accepts a `{ priority: 'primary' }` second argument (`output: 'server'`), mirroring `useTina`'s `experimental___selectFormByFormId`. On SSR pages this is optional — the first `requestWithMetadata()` call is treated as primary automatically.
- `<TinaIsland>` accepts a `primary` prop (`output: 'static'`), since the bridge can't otherwise tell which island endpoint is "the page".

```ts
const post = await requestWithMetadata(
  client.queries.post({ relativePath: `${slug}.md` }),
  { priority: 'primary' },
);
const global = await requestWithMetadata(client.queries.global(...)); // secondary by default
```

The bridge emits a `user-select-form` postMessage for the primary id, which the admin reducer routes around its default selection. The middleware and island route order `[data-tina-form]` payloads with primaries first. If the same id is recorded more than once in a request, the existing entry is upgraded to primary so call order doesn't strand the page's intent. Mark at most one form per page; omitting the hint keeps today's "first non-global wins" heuristic.

**Build warnings fixed.** The `tina()` middleware called `isEditMode()` for every page, reading request headers that don't exist on Astro's synthetic build-time `Request` — each prerendered page logged 1–4 `Astro.request.headers` warnings during `astro build`. Prerendered routes can never be in edit mode, so the middleware now short-circuits via `context.isPrerendered`: it sets `Astro.locals.tinaEdit = false` and calls `next()` without touching headers or the per-request AsyncLocalStorage scopes. SSR behaviour and edit-mode injection are unchanged.
