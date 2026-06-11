---
"@tinacms/graphql": patch
---

fix(@tinacms/graphql): normalize numbers to fixed decimal precision before padding index keys

Numeric index keys are now formatted with fixed decimal precision (e.g. `9` → `"0009.000"`, `8.5` → `"0008.500"`) before zero-padding. This fixes incorrect lexicographic sorting when mixing whole numbers and decimals.

**Index rebuild required:** Self-hosted setups with persistent storage should run a full `tinacms build` to rebuild indices.
