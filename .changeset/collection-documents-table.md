---
'@tinacms/tinacms': patch
---

A collection opens as a table of its documents with folders, filter, sort, paging, rename, duplicate and delete. The content contract gains `create`, `rename`, `delete`, `referrers` and folder operations, and `list` returns a connection. A collection takes `allowedActions` and `description`. The default `editor` role gains `content:create`, `content:rename` and `content:delete`.
