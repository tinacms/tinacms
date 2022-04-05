---
'@tinacms/graphql': patch
---

Fix issue where store.clear() was not being awaited causing an invalid state after reindex
