---
'@tinacms/toolkit': minor
---

Fix #3253 bullet/numbered list items overflow out of text fields

# Change

- Add `w-full` class to list item content to prevent text overflow to the right of sidebar as shown in #3253.
- Also change `<ol></ol>` element class from `pl-2` to `pl-4` to fix numbered list's marker overflow to the left of text field.

