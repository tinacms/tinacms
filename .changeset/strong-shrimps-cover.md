---
"tinacms": patch
"@tinacms/app": patch
---

- Fix server-side branch queries by storing the active branch in a cookie and passing it via the x-branch header.
- Ensure GraphQL playground correctly updates when switching branches.
