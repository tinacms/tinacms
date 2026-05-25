---
"@tinacms/cli": patch
---

Extract the database-bundle esbuild options out of `loadDatabaseFile()` into a pure `buildDatabaseEsbuildConfig()` helper, and add unit tests covering the externalize / output-path contracts.

The helper guarantees:
- `external` includes `better-sqlite3` (and whatever else the caller passes)
- `packages: 'external'` is never set (broad-externalize would break user-side named imports of CJS UMD packages like `sqlite-level` v1 and `mongodb-level`)
- `outfile` is forwarded unchanged from the caller (caller is responsible for putting it inside the project tree via `prepareCacheLocation()`)
- The fixed esbuild options (`bundle`, `platform: 'node'`, `format: 'esm'`, `createRequire` banner, loader map) are stable

Closes the regression-test gap left by the architectural fix in #6790.
