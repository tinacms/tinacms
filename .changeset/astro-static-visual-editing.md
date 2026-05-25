---
"@tinacms/astro": minor
"@tinacms/bridge": minor
"@tinacms/app": minor
---

Support TinaCMS visual editing on statically-built Astro pages.

Wrap editable regions in `<TinaIsland>` and visual editing now works under `output: 'static'` (and mixed static/SSR), provided the adapter can serve the one on-demand route `/tina-island/[name]`. Highlights:

- **Static page support.** `<TinaIsland>` emits a tiny in-iframe bootstrap that fetches `/admin/bridge.js`; on init the bridge "primes" any page with island markers but no server-injected form payloads by calling the island endpoints, which now return the page's form payloads alongside region HTML.
- **Bridge served as a static asset.** Dropped the injected `/_tina/bridge.js` route (some adapters 404'd it) in favour of serving `/admin/bridge.js` from a dev-only Vite plugin and emitting the bundle into the build client output — no source-tree writes. The `@tinacms/astro/bridge-route` subpath export is removed.
- **Re-prime on soft navigation.** `refreshForms` now re-primes when it sees island markers without server-injected payloads, so Astro `ClientRouter` swaps work without a hard reload.
- **Primary-form selection.** Mark the page's main form via `requestWithMetadata(..., { priority: 'primary' })` (SSR) or the `primary` prop on `<TinaIsland>` (static); the admin reducer routes around its default selection so multi-form pages no longer land on "Referenced Files".
- **Prerender-safe middleware.** `tina()` now short-circuits on `context.isPrerendered`, fixing the `Astro.request.headers` warnings that fired on every prerendered route during `astro build`.
- **New `tinaAdminDevRedirect` Vite plugin** at `@tinacms/astro/vite` — redirects `/admin` and `/admin/` to `/admin/index.html` during `astro dev` so a bare `/admin` request lands on the SPA.
