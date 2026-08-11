---
"@tinacms/app": patch
---

Switching a rich-text field to raw markdown no longer risks blanking the whole admin.

The raw editor arrives as a lazy chunk. `Suspense` covered the wait, but nothing caught a rejected import, so a failed fetch tore down the entire editing session: no message, no way back, and any unsaved work in the other fields gone with it. A flaky network or a stale cache after a deploy was enough to trigger it.

The failure now stays inside the field it came from. You get a message saying your content is untouched, and a button back to the rich-text editor.
