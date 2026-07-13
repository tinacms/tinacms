---
"tinacms": patch
---

Remove the unused `monaco-editor` and `@monaco-editor/react` dependencies and the dead raw-editor implementation they backed in `mdx-field-plugin`. The mdx field plugin still accepts a `rawEditor` prop (supplied by `@tinacms/app`, which owns the working Monaco integration) — only the unreachable copy inside `tinacms` itself, and the two packages it alone required, are removed. No public API changes.
