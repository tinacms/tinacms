---
'@tinacms/mdx': patch
---

Escape a `{` in rich-text text when saving MDX, so a field holding text such as `GET/{uuid}` or `{{ title }}` still loads after a save instead of failing to parse.
