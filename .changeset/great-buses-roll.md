---
"tinacms": patch
---

fix: resolve iframe scroll issue after sidebar resize
Refactors: resize handle to use pointer capture events and adds an overlay component. Removes the previous `pointer-events-none` hack that was preventing iframe focus and scrolling after resize.
