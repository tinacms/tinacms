---
"@tinacms/mdx": patch
---

Parse a hard break inside a link instead of collapsing the field.

`staticPhrasingContent` had no `break` case while its sibling `phrasingContent` did, so `[a\`⏎`b](/x)` threw `StaticPhrasingContent: break is not yet supported` and the whole rich-text field rendered as an `invalid_markdown` blob. That markdown is valid CommonMark and can be hand-authored, so it did not need the editor to be involved.

Part of the fix for #7415.
