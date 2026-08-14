---
"@tinacms/mdx": minor
"tinacms": patch
---

Add a dedicated `@tinacms/mdx/sanitize-url` subpath export containing just the URL-scheme sanitizer, and point `tinacms`'s rich-text renderer (`TinaMarkdown` / `StaticTinaMarkdown`) at it instead of the root `@tinacms/mdx` entry. Previously, importing `sanitizeUrl` pulled in `@tinacms/mdx`'s full remark/mdast/micromark markdown-parsing bundle (~2MB) into every site's client bundle, even though rich-text rendering only needs the ~15-line sanitizer. The root `@tinacms/mdx` export of `sanitizeUrl` is unchanged and still works.
