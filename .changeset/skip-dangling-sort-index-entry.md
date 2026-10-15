---
"@tinacms/graphql": patch
---

A collection list sorted by a field now loads when that field's sort index still lists a deleted document. The query skips the missing document instead of failing the whole list with "Error querying file ... from collection". A full reindex removes the stale entry.
