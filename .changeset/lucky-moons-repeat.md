---
"@tinacms/astro": minor
---

Render semantic `<thead>`/`<th>` for markdown tables in the Astro renderer

`TableNode.astro` mirrors the native `table` branch of the React renderer,
so it follows the same change: the first row becomes a `<thead>` of `<th>`
cells, the rest render as `<td>` in `<tbody>`, the `th` override now applies
to markdown tables, and the default inline table border and cell padding are
no longer applied.

**Breaking change:** the same selector and styling updates the `tinacms`
change requires apply here.
