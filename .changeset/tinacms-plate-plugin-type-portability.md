---
"tinacms": patch
---

Give the exported Plate plugin arrays (`plugins`, `viewPlugins`, `createEditorPlugins`) an explicit type, so their emitted declarations no longer carry a `.pnpm/` store path.

The Plate satellite packages take `@udecode/plate` as a peer and never depend on `@udecode/plate-core` directly, so pnpm resolves it through the hoisted store. Once `@tinacms/rich-text` brought in a React 19 copy, the hoisted pick could land on a variant that nothing in `tinacms` is able to name, and `tsc` then failed with TS2742 rather than emit a declaration. Which copy wins varies per install, so the failure came and went.
