---
"@tinacms/graphql": minor
"tinacms": minor
---

Add a `lastUpdated` field to documents' `_sys` (`SystemInfo`) and a `lastUpdated` collection sort, both sourced from an optional `Bridge.lastUpdated(filepath)` capability that integrators can plug in (defaults: git commit time for the isomorphic bridge, file mtime for the filesystem bridge). The value is materialized into the index at index time, so `_sys.lastUpdated` and server-side `documents(sort: "lastUpdated")` work across any store/backend (including self-hosted), not just TinaCloud. The admin collection-listing page shows a "Last Updated" column and offers "Last Updated" in its sort control. Requires a reindex to populate the new sort index.
