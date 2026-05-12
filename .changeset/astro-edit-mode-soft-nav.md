---
"@tinacms/astro": patch
---

🐛 FIX - Detect edit mode for SPA-style fetches (`<ClientRouter />`, Turbo, htmx). The browser sets `Sec-Fetch-Dest: empty` rather than `iframe` on those, so the middleware was short-circuiting and the swapped DOM lost its `[data-tina-form]` payloads — the bridge then closed every form on nav and left the sidebar empty.
