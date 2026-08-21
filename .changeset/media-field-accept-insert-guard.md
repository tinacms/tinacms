---
"@tinacms/schema-tools": minor
"tinacms": minor
---

Add `accept` to the image field, restricting which file types the field will take. A selection outside it now raises an alert instead of being written, and the media picker narrows to matching files where the store supports it. Existing values are left alone.
