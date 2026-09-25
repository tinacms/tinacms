---
"@tinacms/cli": patch
---

Fix `tinacms build` not regenerating `tina/tina-lock.json`. Until now only `tinacms dev` bundled the three `tina/__generated__/*.json` outputs into the legacy lockfile shape that TinaCloud's indexer reads. Projects on a CI-only push workflow (`tinacms build` in CI, never `tinacms dev` between schema edits) ended up with a frozen lockfile and silently stale TinaCloud schemas. The bundling step now runs in both commands via a shared helper.
