---
"@tinacms/bridge": minor
---

✨ FEAT - Emit `url-changed` on SPA history navigation so the admin can pick up route changes that don't unload the page (Astro ClientRouter, Turbo, htmx, etc.). Hard navigations stay covered by the existing `beforeunload` close path.
