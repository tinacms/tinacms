---
'tinacms': patch
---

Fix `Button` and `IconButton` not passing `disabled` to the DOM. Both components used the prop only to pick styling (`pointer-events-none`), which blocks the pointer but not the keyboard, so every disabled button in the CMS stayed focusable and could still be activated with Enter or Space. `busy` is now treated as disabled too, closing a double-submit path on in-flight buttons. `disabled` is omitted when `Button` renders as a tag that does not support it (`as='a'`).
