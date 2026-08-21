---
"@tinacms/mdx": patch
---

Stop writing a hard break that markdown cannot represent where it sits.

`one\` with nothing after it reads back as a literal backslash, so the break is lost and a character the author never typed becomes content. A break before raw HTML or an inline template had the same effect: `toMarkdown` rewrote it as `\` plus a space, or promoted the element out of its paragraph.

Breaks are now dropped in those positions — before raw HTML they become a space, keeping the word separation.

Fixes #5426. Part of #7415.
