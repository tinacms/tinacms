---
'tinacms': patch
---

Fix race condition where `values` was taking longer to update in React state, making the data syncing run too early
