---
"@tinacms/cli": patch
---

Move graphql-codegen to its current majors (~33 MB).

`@graphql-codegen/plugin-helpers@7` drops lodash entirely. Before this, the CLI declared `plugin-helpers` directly at `^7.0.1` while the five codegen plugins it uses all wanted `^5` — so our pin took the hoisted slot and each plugin nested its own copy, each dragging a `lodash` pinned to `~4.17.0` that couldn't use the hoisted `4.18.1` either. Six copies of `plugin-helpers` and six of `lodash`, all but one identical. **Now one of each.**

Three things v7 needs, all handled here:

- **jest couldn't load it.** codegen v6's CJS build `require()`s `auto-bind@5`, which is ESM-only. Node 22 can do that; jest's module registry can't, and jest doesn't transform `node_modules`. Babel now down-levels that one package.
- **`@graphql-inspector/core` v6** makes `ChangeType` a const rather than an enum; the type is `TypeOfChangeType`.
- **codegen v5+ stops exporting `Exact`** from the generated `types.ts`, and defaults unmapped scalars to `unknown` instead of `any` — which would break every `<TinaMarkdown content={data.post._body} />`, since rich-text bodies ride on the `JSON` scalar. Both are pinned back.

No behaviour change: the generated `types.ts`, `frags.gql` and `queries.gql` are unchanged, and the kitchen-sink typechecks with zero new errors.
