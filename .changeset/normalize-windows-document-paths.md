---
'@tinacms/graphql': patch
---

Normalize document IDs and `_sys.path` on Windows to prevent the same document from creating separate Visual Editing forms across query paths.

Mutation resolvers now also work from a POSIX path, so `_sys.hasReferences` is reported correctly and deleting or renaming a referenced document updates the referring documents instead of silently leaving them pointing at the old path.
