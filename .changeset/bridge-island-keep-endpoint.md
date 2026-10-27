---
"@tinacms/bridge": patch
---

Swapping an island's HTML keeps the endpoint the page gave it instead of taking the one the server wrote, which behind a proxy that rewrites paths could point the next refresh at the wrong URL.
