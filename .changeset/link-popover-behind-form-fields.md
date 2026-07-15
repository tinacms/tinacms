---
"tinacms": patch
---

Fix the rich-text link popover not appearing when adding or editing a link.

Since the popover was moved into a portal on `document.body`, `plate-floating`'s inline `z-index: 50` overrode its `z-[999999]` class, so it rendered behind the form field wrappers (which use z-index up to 1000) and was invisible. It now sits above them, so clicking the link button shows the URL input as expected.
