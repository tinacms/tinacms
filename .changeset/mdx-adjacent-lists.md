---
'@tinacms/mdx': patch
---

A rich-text field holding two lists of the same kind in a row now reopens after it is saved. The MDX serializer separated such lists with an HTML comment (`<!---->`), which MDX does not allow, so the whole document fell back to raw text on the next load. It now switches the list marker instead: `*` then `-`, `1.` then `1)`. Files already saved with the comment are not rewritten; remove the `<!---->` line by hand once. Fixes #5238.
