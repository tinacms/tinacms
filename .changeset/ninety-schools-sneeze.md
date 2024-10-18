---
'@tinacms/schema-tools': patch
'@tinacms/graphql': patch
'@tinacms/app': patch
'tinacms': minor
---

Adds referential integrity for renaming and deleting referenced documents.

When a document is renamed, any documents which reference the document will be updated with the new document name. When a document is deleted, the user will be warned and any references to the document will be deleted.
