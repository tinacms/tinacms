---
'tinacms': patch
---

Add `data-test` hooks to group-list field controls

Mirrors the hooks already on simple list fields, so end-to-end tests can target the add button and field wrapper of an object list without depending on Tailwind classes. Nested fields carry their full path, e.g. `add-item-blocks.0.actions`.
