---
'@tinacms/cli': patch
---

Surface the real GraphQL error from TinaCloud when the schema check fails. Previously, when the server responded with a GraphQL errors payload (for example a schema validation error), the CLI discarded the message and reported "The remote GraphQL schema does not exist. Check indexing for this branch.", pointing users at indexing when indexing was fine. The CLI now throws with the server's error message, includes the HTTP status code for non-2xx responses, reports an unparseable response body instead of failing with a JSON syntax error, and keeps the indexing message only for a successful response that genuinely contains no schema. When the server reports that `DocumentFilter` or `DocumentMutation` has no fields, the error also points at a stale `tina/tina-lock.json`, since that means the indexed schema has no collections.
