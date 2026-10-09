---
"@tinacms/graphql": minor
---

Add `Database.deleteIndexEntriesForPaths(paths)`. It removes every sort-index entry for the given paths, including entries left over from an earlier value of the sorted field, which otherwise make a sorted collection list fail with "Error querying file" once the document is deleted. Call it after `deleteContentByPaths` with the same paths.
