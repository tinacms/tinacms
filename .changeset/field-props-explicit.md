---
'tinacms': patch
---

Declare the field props that `react-final-form`'s index signature used to cover

`FieldRenderProps` carried `[otherProp: string]: any` in v6, so the extras `FieldsBuilder` passes to every field plugin — `tinaForm`, `index`, `children`, `experimental_focusIntent` — type-checked implicitly. v7's TypeScript rewrite dropped that index signature, so they are now declared on `FieldProps` directly. The rich-text plugin's `rawMode`, `setRawMode` and `rawEditor` are declared on its own props rather than the shared type.

No runtime change; these props were always being passed.
