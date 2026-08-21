---
'@tinacms/cli': patch
'tinacms': patch
---

Drop the deprecated `crypto-js` dependency

`@tinacms/cli` used it in one place, to generate the default `NEXTAUTH_SECRET` offered during `tinacms init`. `crypto.lib.WordArray.random(16).toString()` is replaced with `randomBytes(16).toString('hex')` from `node:crypto`, which produces the same 32-character hex string. `tinacms` declared the dependency without ever importing it.
