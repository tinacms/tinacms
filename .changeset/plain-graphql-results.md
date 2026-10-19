---
"@tinacms/cli": patch
---

Return plain objects from the self-hosted database client

`graphql-js` builds its result objects with a `null` prototype. React Server
Components reject those when they cross the server/client boundary ("Only plain
objects can be passed to Client Components"), so self-hosted queries failed in
the Next.js App Router. The generated `databaseRequest()` now normalises the
result before returning it.
