---
"tinacms": minor
"@tinacms/graphql": minor
---

Forward the editor's current branch to the TinaCloud assets-api on every cloud media call, and fix staging URL handling for multi-segment branches

`TinaMediaStore` now appends `?branch=<encodedBranch>` to its `upload_url`, `list`, and `delete` requests so that — once the assets-api opts an app into branch-aware media — uploads, listings, and deletions are scoped to the branch the editor is on, instead of always hitting the production branch. The branch is read from `Client.branch` (already URL-encoded) and decoded then re-encoded at the use site to avoid double-encoding.

The query parameter is ignored by assets-api versions that do not parse it, so this change is safe to deploy ahead of the server-side rollout. Local mode is unaffected.

`@tinacms/graphql`'s media URL resolver now formats staging URLs as `/__staging/<branch>/__file/<path>` instead of `/__staging/<encoded-branch>/<path>`. The previous form broke for branches containing `/` (e.g. `feat/my-branch`) because CloudFront decodes paths before downstream components see them, so the S3 write key (with a literal `%2F`) wouldn't match the decoded read path. The `__file` delimiter lets the branch contribute its natural `/` segments while still marking where the file path begins.

Note: staging URLs produced by `@tinacms/graphql@2.3.0`–`2.3.1` use the old format and will not round-trip through this version's `resolveMediaCloudToRelative`. Branch-aware media is gated server-side and has not been enabled for any tenant yet, so no persisted data is expected to be affected — but if you turned it on for testing, regenerate the affected field values from the editor after upgrading.

After a successful cloud upload `TinaMediaStore.persist()` now resolves its return value from the assets-api `list` endpoint instead of constructing each `Media.src` locally — the server is the source of truth for the canonical URL (including the staging-branch path and per-stage CDN host). The `MediaStore.persist()` contract is preserved, so the returned items still flow through the media manager and the image-field drop handler.

Also reserves an optional `rename?(from, to)` hook on the `MediaStore` interface as a future extension point — no implementation yet.
