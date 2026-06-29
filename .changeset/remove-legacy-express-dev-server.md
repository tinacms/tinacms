---
"@tinacms/cli": patch
---

Remove the unused legacy Express dev server (`src/server`). It was superseded by the Vite-based dev server years ago and is no longer reachable from the CLI. Its compiled output was still being published and deep-importable as `@tinacms/cli/dist/server`, exposing an un-gated media upload handler; deleting it removes that dead code path. The active `tinacms dev` server is unaffected.
