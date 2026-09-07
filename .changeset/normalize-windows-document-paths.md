---
'@tinacms/graphql': patch
---

Normalize document IDs and `_sys.path` on Windows to prevent the same document from creating separate Visual Editing forms across query paths.

Also normalize the path compared against the reference index on Windows, so `_sys.hasReferences` is reported correctly and deleting a referenced document no longer skips dangling-reference cleanup.
