---
"tinacms": patch
---

Validate `required` on string list fields that use `ui.component: 'tags'`. The tags field plugin had no `validate` function, so a required tags field showed no "Required" error and the document saved with no tags. The field now reports "Required" when it holds no tags.
