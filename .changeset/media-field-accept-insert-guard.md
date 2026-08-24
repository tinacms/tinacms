---
"@tinacms/schema-tools": minor
"tinacms": minor
---

Add `accept` to the image field, restricting which file types the field will take. It takes an extension, a category (`image`, `video`, `audio`, `document`), or an array of either. The field's own dropzone and the media picker's both refuse a file outside it, the picker narrows the library to matching files, and a selection outside it raises an alert instead of being written. `jpg` and `jpeg` are treated as the same type. Existing values are left alone.
