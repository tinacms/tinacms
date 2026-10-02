---
'tinacms': minor
'@tinacms/mdx': minor
'@tinacms/schema-tools': minor
'@tinacms/astro': minor
---

Rich-text fields can now colour text. A Text Color dropdown now appears next to Highlight in the default toolbar. Fields with a custom `overrides.toolbar` need `'textColor'` added to it. Coloured text saves as `<span style={{ color: "#DC2626" }}>`, or as a single `<mark>` carrying both colours when it's also highlighted.

Both palettes can be set per field under `overrides.textColors` and `overrides.highlightColors` (a list of `{ label, value }`). The highlight palette was previously hard-coded.

Also fixes:
- Bold, italic and strikethrough can now be combined with a highlight. Previously saving threw "Marks inside highlight are not supported".
- Adjacent text with different marks no longer picks up a neighbour's mark on save (e.g. `***a*b**` making `b` bold).
- Highlights in markdown-parser fields are now saved as `<mark>` rather than being dropped.
- Colour values are restricted to plain CSS colours, so content can no longer inject arbitrary CSS through a highlight or text colour.
