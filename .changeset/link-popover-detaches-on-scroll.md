---
"tinacms": patch
---

Fix the rich-text link popover staying in place when you scroll the form.

The popover is rendered in a portal on `document.body`, and its floating-ui reference is a virtual element with no `contextElement`. That left `autoUpdate` with nothing to attach scroll listeners to except the window, so scrolling the form body never repositioned it and the popover drifted away from the text it was anchored to. It now tracks the editor's scroll container.
