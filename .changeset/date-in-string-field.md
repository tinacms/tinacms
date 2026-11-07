---
'@tinacms/graphql': patch
---

Index an unquoted date or timestamp in a `string` field as its ISO string. YAML and TOML parse these values into a `Date`, which stopped indexing with "Unable to seed" and `resolvedValue.substring is not a function`.
