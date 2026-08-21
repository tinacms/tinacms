---
'tinacms': patch
---

Add `data-test` hooks to list field controls

The add and delete buttons on `list: true` fields had no stable selector, so end-to-end tests had to target Tailwind classes. Adds `data-test="list-<name>"` on the field wrapper, `data-test="add-item-<name>"` on the add button, and `data-test="delete-item"` on the delete button it shares with group-list fields.
