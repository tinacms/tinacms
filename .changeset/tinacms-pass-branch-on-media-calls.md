---
"tinacms": patch
---

Forward the editor's current branch to the TinaCloud assets-api on every cloud media call

`TinaMediaStore` now appends `?branch=<encodedBranch>` to its `upload_url`, `list`, and `delete` requests so that — once the assets-api opts an app into branch-aware media — uploads, listings, and deletions are scoped to the branch the editor is on, instead of always hitting the production branch. The branch is read from `Client.branch` (already URL-encoded) and decoded then re-encoded at the use site to avoid double-encoding.

The query parameter is ignored by assets-api versions that do not parse it, so this change is safe to deploy ahead of the server-side rollout. Local mode is unaffected.

Also reserves an optional `rename?(from, to)` hook on the `MediaStore` interface as a future extension point — no implementation yet.
