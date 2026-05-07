---
"@tinacms/graphql": patch
"@tinacms/schema-tools": patch
---

Fix folder creation failing when a collection has `match.exclude` configured.

`TinaSchema.getCollectionByFullPath` was applying the `match.exclude` glob check to `.gitkeep.*` folder placeholder files, causing the collection lookup to return no results. This made `database.put()` throw during `resolveCreateFolder`, blocking folder creation entirely in any collection with `match.exclude` set.

The fix skips the `match.include`/`match.exclude` check for `.gitkeep.*` placeholders in both `TinaSchema` and `Database.put`, mirroring the existing extension-check special-case that already handled these files.
