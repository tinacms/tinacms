---
"@tinacms/cli": patch
---

Clean up the per-build cache directory under `tina/__generated__/.cache/` so it no longer accumulates across runs.

Each invocation creates a fresh `.cache/<timestamp>/` subdir for esbuild output (the bundled `tina/database.ts` and `tina/config.ts`). Two changes:

- The whole subdir is now removed after the dynamic-import resolves — previously only the `.mjs` file was deleted, leaving an empty parent dir behind on every build.
- On startup, any stale `.cache/` content from a crashed prior run (Ctrl+C mid-build, OOM kill, etc.) is swept before the new run's subdir is created.

`tina init` also now adds `tina/__generated__` to `.gitignore` for projects that don't already have it.
