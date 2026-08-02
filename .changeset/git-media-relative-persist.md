---
"tinacms": patch
---

Persist repo-relative paths for git-backed media on cloud uploads, matching local mode. Previously the hosted assets URL was persisted verbatim, which on an editorial-workflow branch baked the staging-scoped path into content and 404s on statically-generated production builds.
