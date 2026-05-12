---
"@tinacms/astro": minor
"@tinacms/bridge": minor
---

Support TinaCMS visual editing on statically-built Astro pages

Visual editing previously required `output: 'server'` — the `tina()` middleware only injects the bridge bootstrap and form payloads on on-demand-rendered responses, so a prerendered page in the admin iframe stayed inert. Now `<TinaIsland>` also emits a tiny in-iframe bootstrap `<script>` (a no-op for normal visitors — it only fetches `/_tina/bridge.js` when the page is inside the admin iframe), and the bridge, on init, "primes" any page that has `[data-tina-island]` markers but no server-injected `[data-tina-form]` payloads by fetching the (still on-demand) island endpoints — which now return the page's form payloads alongside the region HTML when primed. The island route also runs its render inside the request/forms scopes so the editor's overlay is applied on refetch.

The `/_tina/bridge.js` route is now prerendered (it serves static bytes), so it's emitted as a plain file at build time instead of needing a serverless function — fixing a 404 on `output: 'static'` deployments where the static host doesn't deploy on-demand routes.

Net effect: keep `output: 'static'` (or `static` + selective `prerender = false`), wrap editable regions in `<TinaIsland>`, and visual editing works. Pages that use `<TinaIsland>` now carry a ~one-line inline bootstrap script, so their production HTML is no longer byte-identical to a Tina-free Astro app; pages without `<TinaIsland>` are unchanged. SSR projects are unaffected — the middleware path is untouched and `bridge.init()` stays idempotent.
