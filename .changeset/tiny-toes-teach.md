---
"tinacms": minor
---

Render semantic `<thead>`/`<th>` for markdown tables in TinaMarkdown

Markdown (GFM) tables previously rendered every row as `<tbody><td>`, with
no `<thead>` or `<th>` — diverging from standard GFM output and breaking
accessibility (assistive tech relies on `<th>` to associate headers with
data cells) and the `th` component override.

The first row of a markdown table is now rendered as `<thead><th>`,
matching the existing behavior for editor-authored MDX tables. Remaining
rows render as `<tbody><td>` as before. Column alignment is preserved on
both `<th>` and `<td>`.

**Breaking change:** sites that styled table headers via `td` or
`tbody tr:first-child` selectors will need to update those selectors to
target `th`/`thead` instead.
