---
"@tinacms/graphql": patch
---

Build index key range in makeFilterSuffixes when EQ filters cover the leading fields of an index, avoiding full-scan iteration in hasReferences and prefix queries.
