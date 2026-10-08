---
'tinacms': minor
'@tinacms/mdx': minor
'@tinacms/schema-tools': minor
'@tinacms/astro': minor
---

Rich-text fields can now colour text. A Text Color dropdown now appears next to Highlight in the default toolbar. Fields with a custom `overrides.toolbar` need `'textColor'` added to it. Coloured text saves as `<span style={{ color: "#CC4141" }}>`, inside any bold, italic, strikethrough or highlight. The palette can be set per field under `overrides.textColors` (a list of `{ label, value }`).

Also fixes:
- Adjacent text with different marks no longer picks up a neighbour's mark on save (e.g. bold italic text followed by italic text saved both as bold).
- Renderers only apply plain CSS colours, so content can no longer inject arbitrary CSS through a highlight or text colour.
