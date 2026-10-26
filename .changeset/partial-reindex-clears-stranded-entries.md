---
"@tinacms/cli": patch
---

`tinacms build --partial-reindex` now clears every index entry for deleted documents, including entries left over from an earlier value. Self-hosted sites that build this way no longer hit "Error querying file" on a collection sorted by a field that changed before the document was deleted.
