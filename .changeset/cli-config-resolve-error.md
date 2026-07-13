---
"@tinacms/cli": patch
---

Improve the error message when the CLI cannot resolve `tinacms` or a `@tinacms/*` package while building your Tina config or database. It now names the package that failed, reports the directory Tina searched from, and points at parent-directory package-manager files (`package.json`, `node_modules`, `yarn.lock`, `.pnp.cjs`) that can hijack module resolution. esbuild package resolution is also anchored at the project root.
