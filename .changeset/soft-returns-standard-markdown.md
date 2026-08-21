---
"tinacms": patch
---

Make `shift+Enter` produce a line break that survives a save.

Plate's `SoftBreakPlugin` inserts a literal `\n`, which markdown re-flows into a space, so the line break vanished on save. Blockquotes were unaffected because a separate plugin already inserted a `break` element there — hence the inconsistency.

`shift+Enter` now inserts that `break` element everywhere, which serializes to a `\` hard break. Code blocks and GFM table cells keep the old behaviour: one wants a real newline, the other cannot represent a break at all.

`mod+Enter` inside a blockquote works again.

Fixes #6555 and #7408. Part of #7415.
