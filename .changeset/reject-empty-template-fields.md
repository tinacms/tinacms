---
'@tinacms/schema-tools': patch
---

Schema validation now rejects a template with an empty `fields` array. Such a template generated a GraphQL filter input type with no fields, which is invalid per the GraphQL spec and broke every content API request for the project; on TinaCloud that surfaced later as a misleading "The remote GraphQL schema does not exist" error while indexing reported success. `tinacms build` and `tinacms dev` now fail fast with "Property `fields` cannot be empty."

This covers collection templates and the templates on `object` and `rich-text` fields. Any config it rejects could not serve queries before this change either, so no working setup is affected.
