---
"@tinacms/bridge": patch
---

🐛 FIX - Re-prime from island endpoints on every soft navigation, not just on first init. Previously the bridge primed `[data-tina-island]` payloads only inside `init()`, so the first page worked but subsequent ClientRouter swaps landed on a DOM with no `[data-tina-form]` payloads and the bridge announced zero forms — the admin sidebar stayed empty until a hard reload. `refreshForms` now performs the same prime-then-rescan when it sees island markers without server-injected payloads, covering both the initial mount and every `astro:page-load` thereafter.
