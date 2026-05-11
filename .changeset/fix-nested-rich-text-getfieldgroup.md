---
"tinacms": patch
---

Fix crash in `getFieldGroup` when editing deeply nested rich-text fields (3+ levels) with templates. The method used `findIndex` which always searched from the start of the path array, causing it to resolve the wrong "children"/"props" segments on recursive calls. Replaced with `indexOf` searching from the current position, and added a null guard for graceful fallback on malformed content.
