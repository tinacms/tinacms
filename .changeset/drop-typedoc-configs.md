---
'@tinacms/graphql': patch
'@tinacms/search': patch
---

Remove the dead typedoc docs tooling

Both packages declared a `docs` script running `pnpm typedoc` without ever declaring `typedoc` as a dependency, so the script could not resolve its binary under pnpm's isolated `node_modules`. Their `typedoc.json` files were also written against the pre-0.20 option schema (`inputFiles`, `mode`, `excludeNotExported`), which the catalog's typedoc 0.26 no longer accepts. Nothing in `turbo.json` or any workflow invoked them, so the scripts and configs are removed along with the generated `spec.md` in `@tinacms/mdx`.
