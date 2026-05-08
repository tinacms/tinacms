---
"@tinacms/graphql": patch
---

Fix `resolveMediaCloudToRelative` so it strips any TinaCloud cloud URL on save, not only ones whose host matches `config.assetsHost`. The match condition is now host-agnostic: the `<clientId>/…` path prefix is the durable invariant; the host segment can vary across stages.

This unblocks multi-host setups (PR / stage / personal-dev TinaCloud stages) where the dashboard's default `MediaStore` inserts upload URLs with one host while content-api returns a different one as `assetsHost`. Previously the round-trip silently failed and absolute URLs got committed to the content repo. After this fix, content saves as a relative path regardless of which host the dashboard inserted, matching pre-existing content's format.

Also covers cross-stage content migration: an absolute URL written against one stage strips correctly when re-saved against another.

Closes [#6827](https://github.com/tinacms/tinacms/issues/6827).
