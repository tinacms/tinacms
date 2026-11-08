---
'@tinacms/cli': patch
---

Cap Rollup's `maxParallelFileOps` at 100 in the production admin build, so `tinacms build` no longer fails with `EMFILE: too many open files` on hosts with a 1024 open-file limit, such as Cloudflare Workers Builds.
