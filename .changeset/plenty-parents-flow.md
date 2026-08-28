---
'@tinacms/cli': patch
---

Surface the real error from TinaCloud when the `tinacms build` schema checks fail. Previously both remote checks read the response body without looking at the HTTP status or an `errors` array, so any server-side error was reported as "The remote GraphQL schema does not exist. Check indexing for this branch." (or its Tina schema equivalent), pointing users at indexing when indexing was fine. Both checks now throw with the server's own error message, include the HTTP status code for non-2xx responses, report an unparseable response body instead of failing with a JSON syntax error, and keep the "does not exist" message only for a successful response that genuinely contains no schema. When the server reports that `DocumentFilter` or `DocumentMutation` has no fields, the error also points at a stale `tina/tina-lock.json`, since that means the indexed schema has no collections.
