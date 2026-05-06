---
"@tinacms/graphql": patch
---

Add direct unit test coverage for the GraphQL resolver's CRUD methods (#6466). 115 tests covering `resolveFieldData`, `build*Mutations`, `resolveLegacyValues`, and every method that took over from the deprecated `resolveDocument`. `resolveFieldData` is now exported from the resolver module to enable direct unit testing — no public API change since the package entry doesn't re-export it.
