---
'@tinacms/tinacms': patch
---

Fix array item removal when nested object fields were never set, so removed list entries do not backfill object defaults onto sibling items.
