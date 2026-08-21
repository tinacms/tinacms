---
"@tinacms/mdx": patch
---

Split an `h3`–`h6` on a hard break instead of losing it.

Those levels have no setext form, so the break silently degraded to a space and the author's line break vanished with no error. A break in an `h3`–`h6` now splits it into headings of the same level, so the content and the break both survive and the next save is a fixed point.

`#` and `##` are unchanged — they have a setext form, so the break already survives there as a real break.

Part of #7415.
