---
"tinacms": minor
---

Render semantic `<thead>`/`<th>` for markdown tables in TinaMarkdown

Markdown (GFM) tables previously rendered every row as `<tbody><td>`, with
no `<thead>` or `<th>`. That diverges from standard GFM output and breaks
accessibility (assistive tech relies on `<th>` to associate headers with
data cells) as well as the `th` component override.

The first row of a markdown table is now rendered as `<thead><th>`,
matching the existing behavior for editor-authored MDX tables. Remaining
rows render as `<tbody><td>` as before. Column alignment is preserved on
both `<th>` and `<td>`.

**Breaking change:** sites that styled table headers via `td` or
`tbody tr:first-child` selectors will need to update those selectors to
target `th`/`thead` instead.

**Breaking change:** the default inline `border: 1px solid #EDECF3` on
`<table>` and the `border`/`padding: 0.25rem` on cells are no longer
applied, and `align` is no longer leaked onto the DOM as a raw attribute.
Tables now inherit your stylesheet instead of the inline styles that used
to beat it on specificity, so a table that rendered as a boxed grid will
look different until you style it yourself.
