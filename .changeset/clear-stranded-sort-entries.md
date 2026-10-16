---
"@tinacms/graphql": minor
---

Add `Database.deleteIndexEntriesForPaths(paths)`. It removes every sort-index and reference entry for the given paths, including entries left over from an earlier value of a field. Left in place, those entries make a sorted collection list fail with "Error querying file" once the document is deleted, and make deleting or renaming a document it once referenced fail. Call it after `deleteContentByPaths` with the same paths.
