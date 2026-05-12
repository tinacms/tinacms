---
"@tinacms/astro": minor
"@tinacms/bridge": minor
---

Support TinaCMS visual editing on statically-built Astro pages

Visual editing previously required `output: 'server'` — the `tina()` middleware only injects the bridge bootstrap and form payloads on on-demand-rendered responses, so a prerendered page in the admin iframe stayed inert. Now `<TinaIsland>` also emits a tiny in-iframe bootstrap `<script>` (a no-op for normal visitors — it only fetches `/admin/bridge.js` when the page is inside the admin iframe), and the bridge, on init, "primes" any page that has `[data-tina-island]` markers but no server-injected `[data-tina-form]` payloads by fetching the (still on-demand) island endpoints — which now return the page's form payloads alongside the region HTML when primed. The island route also runs its render inside the request/forms scopes so the editor's overlay is applied on refetch.

The bridge bundle is now shipped as a plain static asset at `/admin/bridge.js` (staged into `public/admin/` by the integration, next to the admin UI), rather than served by an injected `/_tina/bridge.js` route. An injected on-demand route isn't given a Build Output route entry by some adapters (e.g. `@astrojs/vercel` in `output: 'static'` mode), which 404'd it; a static file under `/admin/` — a path every deploy already serves — sidesteps that entirely. The `@tinacms/astro/bridge-route` subpath export is removed.

Net effect: keep `output: 'static'` (or `static` + selective `prerender = false`), wrap editable regions in `<TinaIsland>`, and visual editing works — provided the adapter can serve the one remaining on-demand route (`/tina-island/[name]`). Pages that use `<TinaIsland>` now carry a ~one-line inline bootstrap script, so their production HTML is no longer byte-identical to a Tina-free Astro app; pages without `<TinaIsland>` are unchanged. SSR projects are unaffected — the middleware path is untouched and `bridge.init()` stays idempotent.
