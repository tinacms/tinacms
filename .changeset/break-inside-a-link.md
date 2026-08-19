---
"@tinacms/mdx": patch
---

Parse a hard break, and strikethrough, inside a link instead of collapsing the field.

Link children go through `staticPhrasingContent`, a narrower switch than the `phrasingContent` one used everywhere else. It was missing both `break` and `delete`, so `[a\`⏎`b](/x)` and `[~~a~~](/x)` each threw `StaticPhrasingContent: ... is not yet supported` and the whole rich-text field rendered as an `invalid_markdown` blob.

Both are valid CommonMark and can be hand-authored, so neither needed the editor to be involved.

Part of the fix for #7415.
