---
"@tinacms/auth": patch
"@tinacms/cli": patch
"@tinacms/mdx": patch
"@tinacms/metrics": patch
"@tinacms/schema-tools": patch
"@tinacms/vercel-previews": patch
"@tinacms/webpack-helpers": patch
"tinacms-authjs": patch
"tinacms-gitprovider-github": patch
---

chore(tinacms-pkgs): point `repository.directory` at each package's own folder

Eight packages declared a `repository.directory` copied from whichever package they were forked from, so the "repository" link on their npm pages resolved to unrelated source. Also drops a dead `generate:schema` script from `@tinacms/metrics`, `@tinacms/cli` and `@tinacms/schema-tools` - it referenced a `scripts/generateSchema.js` that has never existed in the repo and nothing invoked it.
