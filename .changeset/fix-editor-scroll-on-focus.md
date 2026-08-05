---
"tinacms": patch
---

Fix rich-text editor scrolling to cursor position when opened via `experimental_focusIntent`.

When a field with `experimental_focusIntent` was rendered, the programmatic focus call triggered the browser's default scroll-to-cursor behavior, causing the editor to open scrolled to the middle of the content instead of the top. The fix uses `preventScroll: true` on the focus call and resets `scrollTop` to 0 on the wrapper element.
