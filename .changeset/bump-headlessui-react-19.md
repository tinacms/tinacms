---
'@tinacms/rich-text': patch
---

Replace the Headless UI popover behind the embed Edit/Remove menu with the Radix Popover already used elsewhere in the rich-text editor, and drop `@headlessui/react` from `@tinacms/rich-text`. The package no longer depends on Headless UI's React peer range, so React 19 projects stop getting `ERESOLVE overriding peer dependency` warnings from it.
