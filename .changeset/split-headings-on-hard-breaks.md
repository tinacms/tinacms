---
"@tinacms/mdx": patch
---

Split an `###`-and-deeper heading on a hard break instead of losing it.

Those levels have no setext form, so `mdast-util-to-markdown` silently degraded the break to a space: `### one⏎two` was written as `### one two` and the author's line break vanished with no error.

A break in an `h3`–`h6` now splits it into headings of the same level. The content and the line break both survive, the file keeps its ATX style, and the result is a fixed point on the next save.

`#` and `##` are unchanged — they have a setext form, so the break already survives as a real break in one heading, and files already carry that shape. A trailing break in a heading is dropped at every level rather than splitting off an empty one.

Part of #7415.
