---
"tinacms": patch
---

Harden message handling in the `useEditState` hook so it validates the sender of incoming `message` events, matching the `isFromAdmin(event, trustedAdminOrigins)` check already used by `useTina`. The hook now also removes its `message` listener on unmount. Legitimate admin→preview behavior is unchanged.
