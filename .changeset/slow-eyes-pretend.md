---
'@tinacms/mdx': patch
---

Treat images as block-level when they're isolated in a paragraph.

Previously all images were nested inside `<p>` elements when coming from the server, but treated as block level by the rich-text editor. This resulted in a scenario where new paragraphs adjacent to images were nested
in parent `<p>` tags, which caused an error.
