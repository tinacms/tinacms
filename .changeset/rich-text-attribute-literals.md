---
"@tinacms/mdx": patch
---

Rich-text component values that contain a quote, backslash or newline now save and load back unchanged. Each value in a string, datetime, reference or image list is written as a JSON string literal. Values without those characters are written exactly as before.

Number and boolean values must now be real numbers or booleans. If a value is not, the save fails with a message that names the field. A highlight colour that contains characters a CSS colour cannot have is dropped on save, and the text stays highlighted.
