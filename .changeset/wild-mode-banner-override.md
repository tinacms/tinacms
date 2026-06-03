---
"@tinacms/cli": patch
"@tinacms/app": patch
"tinacms": patch
---

Local mode is now driven by `TINA_PUBLIC_IS_LOCAL` (default: local for `tinacms dev`, not-local for `tinacms build`) instead of being inferred from the content API URL — fixing self-hosted setups that incorrectly showed the "You are in local mode" banner.
