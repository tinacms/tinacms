---
'tinacms': patch
---

Move `moment-timezone` to devDependencies so its timezone database no longer ships in the admin bundle. It was loaded via a non-tree-shakeable side-effect import, but production code never used the `moment.tz` API (only a unit test did). Removes ~39 KB gzip (~732 KB uncompressed) from the first admin load. No behavior change.
