---
"@tinacms/graphql": minor
"@tinacms/cli": minor
---

Give rich-text its own GraphQL scalar, so `_body` is actually typed.

**This is a breaking change for TypeScript consumers.** It is the good kind: it surfaces bugs that `any` was hiding.

Rich-text fields were typed with the generic `JSON` scalar — the same one carrying `_values`, `templates` and `fields`. One scalar means one TypeScript mapping, and the only one that suited both an editable document AST and an arbitrary blob was `any`. So `data.post._body` came out untyped, even though TinaCMS already ships the exact type it should be: `TinaMarkdownContent`, which is what `<TinaMarkdown/>` demands.

Rich-text fields now use a dedicated `RichText` scalar:

```
RichText  -> TinaMarkdownContent   (real type)
JSON      -> unknown               (arbitrary, and now says so)
Reference -> unknown
```

Query documents are unchanged, and no resolver is needed — `buildASTSchema` gives custom scalars passthrough behaviour, so the server indexes and resolves rich text exactly as before. `schema.gql` gains `scalar RichText`.

**Migrating:** `_body` is now `Maybe<TinaMarkdownContent>`, so passing it straight to `<TinaMarkdown content={...} />` will fail to compile where the field is optional. Guard it:

```diff
- <TinaMarkdown content={data.post._body} />
+ {data.post._body && <TinaMarkdown content={data.post._body} />}
```

That is not busywork. It caught two latent null-safety bugs in our own kitchen-sink, both fixed here — `markdown-components.tsx` already guarded its equivalents; these two sites simply didn't, and nothing was checking.
