---
"@tinacms/mdx": patch
---

Split an `h3`–`h6` on a hard break instead of losing it. Those levels have no setext form, so the break silently became a space. `#` and `##` are unchanged. Part of #7415.
