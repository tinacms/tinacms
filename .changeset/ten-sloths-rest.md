---
'@tinacms/graphql': patch
'tinacms': patch
---

Fixes a bug with `breadcrumbs` to account for subfolders (instead of just the `filename`) and allows Documents to be created and updated within subfolders.

Before this fix, `breadcrumbs` was only the `basename` of the file minus the `extension`.  So `my-folder-a/my-folder-b/my-file.md` would have `breadcrumbs` of `['my-file']`.  With this change, `breadcrumbs` will be `['my-folder-a','my-folder-b','my-file']` (leaving out the `content/<collection>`).
