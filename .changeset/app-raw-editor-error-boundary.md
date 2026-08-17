---
"@tinacms/app": patch
---

Switching a rich-text field to raw markdown no longer blanks the whole admin.

Two things could take the editing session down. The raw editor arrives as a lazy chunk, so a failed fetch after a deploy or on a flaky connection tore the page down. It also serializes the field while rendering, so content it cannot represent threw with the chunk already loaded. Applying inline code and then bolding a word inside it was enough. Either way you got a blank page: no message, no way back, and unsaved work in the other fields gone with it.

The failure now stays inside the field it came from. You get the thrown message, which for the formatting case names what to undo, and a button back to the rich-text editor.
