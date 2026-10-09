---
"tinacms": patch
---

Fix the form fields shown after navigating back to a nested block through the breadcrumb. A path ending on a list field rather than on one of its items returned the surrounding group with its field names unprefixed, and an unprefixed name addresses the top of the document. Where a nested list shared a name with a top-level field, the breadcrumb therefore rendered the top-level list under the nested list's templates, and the list's add, remove and reorder reached the wrong array.
