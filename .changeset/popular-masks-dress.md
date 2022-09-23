---
"tinacms": patch
"@tinacms/app": patch
---

Fixes an issue in the standalone version of `useTina` which didn't reflect changes when only query variables updated.

Also fixes an issue where the new `global: true` wasn't being respected in the standalone hooks
