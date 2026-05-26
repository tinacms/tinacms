---
"@tinacms/graphql": patch
---

Adds schema-level validation for `ui.component: "checkbox-group"` fields. Fields using `checkbox-group` without `list: true`, including nested object/template fields, now fail schema validation with a clear error to catch configurations that can cause runtime GraphQL mismatches.
