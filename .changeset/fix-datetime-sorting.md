---
"@tinacms/graphql": patch
---

fix(@tinacms/graphql): use ISO 8601 strings for datetime index keys to fix sorting for all dates

Datetime fields are now stored as ISO 8601 strings in index keys instead of Unix timestamps. This fixes incorrect sorting for dates before September 10, 2001 (digit-length boundary) and before 1970 (negative timestamps).

**Index rebuild required:** This changes the index key format. Local dev/build users are unaffected (indices rebuild automatically). Self-hosted setups with persistent storage should run a full `tinacms build` to rebuild indices.
