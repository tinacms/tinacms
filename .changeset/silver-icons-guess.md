---
'@tinacms/graphql': minor
---

When working with a new document that queries for a reference, we were not properly building the path information required to update that reference, resulting in an error until the page was refreshed.
