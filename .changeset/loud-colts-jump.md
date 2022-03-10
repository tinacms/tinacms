---
'tinacms': patch
---

Ensure client-side Tina code only runs on the browser. Without this check, we'd see a server/client mismatch like:

```
warning.js:33 Warning: Expected server HTML to contain a matching <div> in <body>.
```
