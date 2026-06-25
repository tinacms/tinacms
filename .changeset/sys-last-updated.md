---
"@tinacms/graphql": minor
"tinacms": minor
---

Add a `lastUpdated` field to documents' `_sys` (`SystemInfo`), sourced from the content store's last-write time when the store can report it. The admin collection-listing page now shows a "Last Updated" column with relative times and lets you sort the loaded page by filename or last updated via clickable column headers.
