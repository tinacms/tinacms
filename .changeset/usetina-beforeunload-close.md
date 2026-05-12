---
"tinacms": patch
---

🐛 FIX - Post `close` from `useTina` on `beforeunload` so hard navigations inside the editor iframe (Astro `<a href>` clicks, full reloads) retire the form properly. SPA-style navigation continues to flow through the existing unmount cleanup; a guard prevents double-posting.
