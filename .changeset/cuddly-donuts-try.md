---
'@tinacms/vercel-previews': patch
'@tinacms/cli': patch
'tinacms': patch
---

Add support for "quick editing". By adding the `[data-tina-field]` attribute to your elements, editors can click to see the
correct form and field focused in the sidebar.

This work closely resembles the ["Active Feild Indicator"](https://tina-io-git-quick-edit-tinacms.vercel.app/docs/editing/active-field-indicator/) feature.
Which will be phased in out place of this in the future. Note that the attribute name is different, `[data-tinafield]` is the value
for the "Active Field Indicator" while `[data-tina-field]` is the new attribute.

The `tinaField` helper function should now only be used with the `[data-tina-field]` attibute.

Adds experimental support for Vercel previews, the `useVisualEditing` hook from `@tinacms/vercel-previews` can be used
to activate edit mode and listen for Vercel edit events.
