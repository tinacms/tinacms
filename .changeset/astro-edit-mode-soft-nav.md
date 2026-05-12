---
"@tinacms/astro": patch
---

🐛 FIX - Detect edit mode for soft-navigation requests (Astro `<ClientRouter />`, Turbo, htmx, etc.). When the iframe fetches the next page instead of letting the browser do a full iframe navigation, the browser sets `Sec-Fetch-Dest: empty` rather than `iframe`. The middleware now also accepts `Sec-Fetch-Dest: empty` + `Sec-Fetch-Site: same-origin` + `__tina_edit=1` cookie, so the swapped DOM still receives the `[data-tina-form]` payloads the bridge needs.

Without this, the bridge's `refreshForms()` saw zero forms after a soft nav and closed every form in the registry, leaving the sidebar empty.
