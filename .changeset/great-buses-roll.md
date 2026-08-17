---
"tinacms": patch
---

Fix the preview iframe going unresponsive after resizing the sidebar.

Dragging the resize handle used to disable pointer events on the entire app so the drag would survive the cursor crossing into the preview. Releasing the drag over the preview left it dead to clicks and scrolling until you clicked the sidebar again. The handle now uses pointer capture, which keeps the drag targeting the handle without touching the rest of the page, so the preview stays interactive throughout.

Also corrects the handle's fullscreen guard, which read a `fullscreen` key the sidebar context has never provided and so never fired. No behaviour change today, since nothing currently puts the sidebar into the fullscreen display state.
