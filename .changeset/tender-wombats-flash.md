---
"@tinacms/cli": patch
---

Add `--content=local` flag to `tinacms build` for fast production builds that source content from local disk while keeping the generated client pointed at TinaCloud (so SSR/ISR routes still work at runtime). Validates against TinaCloud and forces `NODE_ENV=production` for chained sub-commands.
