---
'@tinacms/astro': patch
---

`<TinaMarkdown>` accepts the rich-text type that `@tinacms/cli` 3 generates. The CLI types rich-text fields as `TinaMarkdownContent` from `tinacms`, and `content` accepted only `TinaRichTextContent`, so passing a field such as `data._body` straight from a query failed `astro check`. Both types describe the same AST, so the rendered output does not change.

To type a component that wraps `<TinaMarkdown>`, use `TinaMarkdownProps['content']` from `@tinacms/astro/types`.
