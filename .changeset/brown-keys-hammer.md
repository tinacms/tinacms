---
'@tinacms/graphql': patch
---

Fix issue where un-normalized rich-text fields which send `null` values to the server on save would cause a parsing error
