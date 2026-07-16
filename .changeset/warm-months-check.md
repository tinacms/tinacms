---
"@tinacms/cli": minor
---

`tinacms dev` and `tinacms build` now warn at startup when the `tinacms`, `@tinacms/graphql`, or `@tinacms/schema-tools` versions resolved from the project don't satisfy the ranges the CLI was published with, or when two different copies of `tinacms` are installed. A held-back package (stale lockfile entry, partial upgrade, pnpm `minimumReleaseAge`) previously failed silently: the admin built fine but served an older `tinacms` where newer documented features were missing.
