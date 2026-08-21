---
"tinacms": patch
---

Make `shift+Enter` produce a line break that survives a save. Plate inserted a literal `\n`, which markdown re-flowed into a space, so the break vanished everywhere except blockquotes. Code blocks and table cells are unchanged. Fixes #6555 and #7408.
