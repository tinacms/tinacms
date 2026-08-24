---
'tinacms': patch
---

Add `data-test` hooks to list field controls

The add and delete buttons on `list: true` fields had no stable selector, so end-to-end tests had to target Tailwind classes. Adds `data-test="list-<name>"` on the field wrapper, `data-test="add-item-<name>"` on the add button, and `data-test="delete-item-<name>.<index>"` on the delete button shared with group-list and blocks fields.

Every hook carries the full field path. The wrapper hook lands on the outer field wrapper, so a nested list's delete buttons are descendants of the outer list's wrapper; a bare id would make `[data-test="list-x"] [data-test="delete-item"]` match the wrong row once lists nest.
