---
"@tinacms/astro": patch
---

Skip the TinaCMS Astro middleware's request-header parsing on prerendered routes

The `tina()` integration's middleware called `isEditMode(context.request)` for every page, which reads `Sec-Fetch-Dest`/`Referer`/`Cookie`. During `astro build` for static routes, Astro's synthetic build-time `Request` has no real headers, so each prerendered page logged an `Astro.request.headers` warning (1–4 per page). Prerendered routes can never be in edit mode, so `onRequest` now short-circuits via `context.isPrerendered` — it sets `Astro.locals.tinaEdit = false` and calls `next()` without touching headers or the per-request AsyncLocalStorage scopes. SSR behaviour and edit-mode injection are unchanged.
