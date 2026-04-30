---
"tinacms": patch
---

Fix "Save to new branch" failing with "Branch operation failed" when the file path contains repeated or leading/trailing slashes (e.g. when a collection's `path` has a trailing slash, producing `content/articles//foo.mdx`). The default branch name derived from the file path is now normalised — repeated slashes are collapsed and leading/trailing slashes are stripped — so the resulting Git ref is valid. The same normalisation is applied to user-typed input at the assembly site as defence-in-depth.
