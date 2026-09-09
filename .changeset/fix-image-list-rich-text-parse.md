---
"@tinacms/mdx": patch
---

Fix a crash when parsing rich-text containing an `image` field with `list: true`. The image-list branch called `.split(',')` on the array returned by `extractScalar`, throwing `TypeError: values.split is not a function`; the error was wrapped as a parse failure, so the block became an `invalid_markdown` node (content dropped in the editor) or failed `tinacms build`. It now maps over the array like the other list field types.
