---
'tinacms': patch
---

Remove the dead `mdx-field-plugin/plate/plugins/ui/icons.tsx` module (398 lines of unused inline-SVG icons). Its single consumed export (`EllipsisIcon`) now resolves from the shared `plate-ui/icons` module. No behavior change.
