---
"@tinacms/graphql": patch
---

Find a document's references by walking it against its schema rather than by evaluating schema-derived JSONPath over it. The expressions could not describe a templated list item, which is tagged `_template` rather than nested under a key of that name, and could not reach inside a `rich-text` field, which is stored as text. References in either shape were missing from the index, so `_sys.hasReferences` reported false for them and renaming or deleting such a document left those references pointing at a path that no longer existed. `findReferences` also took the default page of 50, which silently capped how many a rename or delete went on to fix.

Existing indexes keep answering lookups, but entries the old build wrote are not replaced on a single document write — reindex to pick up the references it missed and to clear stale entries.
