---
"@tinacms/graphql": major
"@tinacms/cli": major
---

Rich-text fields use a new `RichText` GraphQL scalar, and the generated TypeScript types map it to `TinaMarkdownContent` instead of `any`.

Rich-text fields used the generic `JSON` scalar, which `_values`, `templates` and `fields` also use. A scalar maps to one TypeScript type, and `any` was the only type that fit both a rich-text document and arbitrary JSON. So `data.post._body` came out as `any`, and TypeScript did not check code that read it.

```
RichText -> TinaMarkdownContent   (new)
JSON     -> any                   (unchanged, so `_values` still indexes freely)
```

GraphQL query documents do not change, and the server needs no resolver for the new scalar. `buildASTSchema` passes custom scalars through, so the server indexes and resolves rich text as before. In `schema.gql`, rich-text fields change from `JSON` to `RichText`.

This breaks TypeScript code that relied on `any`. TypeScript now reports reads of properties that `TinaMarkdownContent` does not declare, such as `.text` on a text node or `.slice` on the body. To read node properties such as `text`, add them to your own node type.

Update `tinacms` at the same time. `<TinaMarkdown>` in the latest `tinacms` accepts a `null` or `undefined` `content`, so you can pass an optional rich-text field to it without a guard.
