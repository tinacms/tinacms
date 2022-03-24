---
"@tinacms/graphql": patch
"@tinacms/schema-tools": patch
"tinacms": patch
---

Add `parentTypename` to fields to allow us to disambiguate between fields which have the same field names but different types. Example, an event from field name of `blocks.0.title` could belong to a `Cta` block or a `Hero` block, both of which have a `title` field.
