---
'tinacms': patch
---

Fixes an issue where new documents returned a 404 when on a hosted deployement. Instead, `getStaticPropsForTina` will catch and return an empty object for the data key. This allows us to replace it with real data client-side.
