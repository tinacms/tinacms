---
'@tinacms/graphql': patch
---

Fix issue where the `isBody` field wasn't properly removing that value from frontmatter. Ensure that the field is not treating any differently for JSON format
