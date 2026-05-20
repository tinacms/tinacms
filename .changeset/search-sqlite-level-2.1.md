---
"@tinacms/search": patch
---

Bump `sqlite-level` from `^2.0.0` to `^2.1.0`. The new sqlite-level transitively pulls in `better-sqlite3@12.10.0`, which is the first `better-sqlite3` line to ship Node 24 (`NODE_MODULE_VERSION 137`) prebuilt binaries. This resolves the Node 24 `npm install` failure tracked in [#6686](https://github.com/tinacms/tinacms/issues/6686) — fresh installs on Node 24 no longer fall back to `node-gyp rebuild` and no longer require a local Python + C++ toolchain. No API changes.
