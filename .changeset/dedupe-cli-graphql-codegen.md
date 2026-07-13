---
"@tinacms/cli": patch
---

Deduplicate the CLI's graphql-codegen tree (~26 MB).

`@tinacms/cli` declared `@graphql-codegen/plugin-helpers` directly at `^7.0.1`, while the five codegen plugins it actually uses (`core`, `typescript`, `typescript-operations`, `visitor-plugin-common`, and the transitive `schema-ast`) all want `^5`. Our v7 pin took the hoisted top-level slot, so npm nested a separate copy of `plugin-helpers@5.1.1` under **each** plugin — and each of those pulled its own `lodash`, pinned `~4.17.0`, which cannot use the hoisted `lodash@4.18.1` either.

The result was six copies of `plugin-helpers` and six of `lodash`, all but one of them identical.

Aligning our direct dependency to `^5.1.0` lets one `plugin-helpers` hoist and be shared: **lodash goes from 6 copies to 1.** `@graphql-codegen/core` is also bumped `^2.6.8` → `^4.0.2` so it wants the same `plugin-helpers` major as the other plugins, and `@graphql-inspector/core` is aligned to `^6.2.1` to match `tinacms` (it was `^4.2.2`, so both majors were installed).

No behaviour change: the generated `types.ts`, `frags.gql` and `queries.gql` are byte-identical before and after.
