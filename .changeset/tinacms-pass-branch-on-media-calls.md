---
"tinacms": patch
"@tinacms/graphql": patch
---

Forward the editor's current branch to the TinaCloud assets-api on every cloud media call, and fix staging URL handling for multi-segment branches

`TinaMediaStore` now appends `?branch=<encodedBranch>` to its `upload_url`, `list`, and `delete` requests so that — once the assets-api opts an app into branch-aware media — uploads, listings, and deletions are scoped to the branch the editor is on, instead of always hitting the production branch. The branch is read from `Client.branch` (already URL-encoded) and decoded then re-encoded at the use site to avoid double-encoding.

The query parameter is ignored by assets-api versions that do not parse it, so this change is safe to deploy ahead of the server-side rollout. Local mode is unaffected.

`@tinacms/graphql`'s media URL resolver now formats staging URLs as `/__staging/<branch>/__file/<path>` instead of `/__staging/<encoded-branch>/<path>`. The previous form broke for branches containing `/` (e.g. `feat/my-branch`) because CloudFront decodes paths before downstream components see them, so the S3 write key (with a literal `%2F`) wouldn't match the decoded read path. The `__file` delimiter lets the branch contribute its natural `/` segments while still marking where the file path begins.

After a successful upload the media manager now refreshes its list from the server rather than prepending locally-constructed entries — the server is the source of truth for the canonical `src` URL (including the staging-branch path when applicable).

Also reserves an optional `rename?(from, to)` hook on the `MediaStore` interface as a future extension point — no implementation yet.
