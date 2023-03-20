---
'@tinacms/schema-tools': patch
---

Support more forgiving markdown parser for non-MDX collections. Previously, this feature was only available by opting in
with the `parser: {type: "markdown"}` configuration on a rich-text field. Now, all `rich-text` fields will adhere to the
appropriate parser based on their collection format, but can continue to be overridden manually.
