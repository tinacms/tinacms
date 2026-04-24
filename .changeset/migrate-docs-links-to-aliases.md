---
"@tinacms/cli": patch
"@tinacms/graphql": patch
"create-tina-app": patch
"tinacms": patch
---

Migrate docs links in shipped package code from raw `tina.io/docs/<path>` URLs to aliased `tina.io/docs/r/<alias>` URLs so the links survive future docs restructuring.
