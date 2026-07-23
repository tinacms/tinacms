---
"@tinacms/app": patch
---

Remove `typescript` from `@tinacms/app`'s production dependencies.

It was declared in both `dependencies` and `devDependencies`, but nothing in `src/` imports it — the package ships raw source and is compiled by `@tinacms/cli`. Every TinaCMS user was installing a second copy of the TypeScript compiler (~23 MB) for nothing. It remains a devDependency for type-checking.
