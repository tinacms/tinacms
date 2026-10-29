---
"@tinacms/mdx": patch
---

Rich-text component values that contain a quote, backslash or newline now save and load back unchanged. Tina writes each value in a string, datetime, reference or image list as a JSON string literal. Values without those characters stay exactly as before.

Negative numbers and image lists on rich-text components now load back. Before, a negative number turned the block into invalid markdown, and an image list failed to load.

Number and boolean values must be real numbers or booleans. If one is not, the save fails with a message that names the field. If you clear a number field, Tina saves it as `null`. Tina drops a highlight colour that contains characters a CSS colour cannot have, and the text stays highlighted.
