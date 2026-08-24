---
'@tinacms/metrics': patch
---

Drop the `fs-extra` peer dependency

`@tinacms/metrics` declared `fs-extra@^9.0.1` as a peer while the repo itself ran `^11.3.0`, so the range was never satisfied and every install printed an unmet-peer warning. The one call site read `package.json` with `readFileSync`, which fs-extra re-exports unchanged from `node:fs`, so the peer is replaced with the builtin and `@types/node` covers the types that previously arrived through `@types/fs-extra`.
