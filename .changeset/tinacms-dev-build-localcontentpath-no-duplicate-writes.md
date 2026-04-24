---
"@tinacms/cli": patch
"@tinacms/graphql": patch
---

Stop writing generated files (`_schema.json`, `_graphql.json`, `_lookup.json`, `tina-lock.json`) to the content repo when `localContentPath` is set. Generated files now live only in the generator repo's `tina/__generated__/`. The content repo is no longer required to contain a `tina/` folder. Closes [tinacms/tinacloud#3295](https://github.com/tinacms/tinacloud/issues/3295).

**⚠️ Compatibility note:** This release must not promote to `@latest` until tinacloud prod has deployed [tinacms/tinacloud#3403](https://github.com/tinacms/tinacloud/issues/3403). Pre-#3403 tinacloud reads `tina-lock.json` from the content repo on generator pushes; shipping this change before the server-side fix breaks existing multi-repo users' indexing. After upgrade, any stale `tina/` folder left over in a content repo is safe to delete — nothing reads it any more.
