---
"@tinacms/cli": patch
---

`tinacms build` now regenerates `tina/tina-lock.json`, which TinaCloud reads to index your schema. Before this, only `tinacms dev` wrote it, so a project that changed its schema and only ran `tinacms build` locally committed a stale lock file. A build in CI still doesn't commit the file, so after a schema change run `tinacms build` or `tinacms dev` locally and push `tina/tina-lock.json`.
