---
'tinacms': minor
'@tinacms/schema-tools': minor
---

Reference fields accept `ui.allowCreate`. When set, a "New <collection>" action under the picker opens the referenced collection's create form in a modal and selects the new document once it is saved, so editors no longer have to leave the current form to create the thing they want to reference. The admin's create page and the modal share one form builder, so filename rules, slugify, templates and validation behave the same in both.
