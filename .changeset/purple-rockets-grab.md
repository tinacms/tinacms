---
'@tinacms/graphql': patch
---

Don't cache graphql schema during resolution, this was causing the schema to go stale, while updating the schema.gql, so GraphQL tooling thought the value was updated, but the server was still holding on to the cached version
