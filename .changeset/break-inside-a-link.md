---
"@tinacms/mdx": patch
---

Parse a hard break, and strikethrough, inside a link. `[a\`⏎`b](/x)` and `[~~a~~](/x)` both threw, collapsing the whole rich-text field to an `invalid_markdown` blob. Part of #7415.
