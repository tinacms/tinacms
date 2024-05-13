---
'tinacms': patch
---

- Used `useMemo` to memoize the slug value, ensuring it's not recomputed unless dependencies change. 
