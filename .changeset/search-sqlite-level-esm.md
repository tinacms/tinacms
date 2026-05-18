---
"@tinacms/search": patch
---

Bump `sqlite-level` to `^2.0.0` and switch back to a named `import { SqliteLevel } from 'sqlite-level'`. The previous namespace-import workaround was needed because `sqlite-level` shipped as CJS and esbuild's default-import rewrite broke ESM named-export resolution; with the upstream CJS-to-ESM migration ([tinacms/sqlite-level#24](https://github.com/tinacms/sqlite-level/pull/24)) released as `sqlite-level@2.0.0`, that workaround is no longer required.
