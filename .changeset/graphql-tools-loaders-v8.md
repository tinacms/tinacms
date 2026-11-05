---
'@tinacms/cli': patch
---

Move `@graphql-tools/load` to 8.1.21 and `@graphql-tools/graphql-file-loader` to 8.1.24, so the CLI no longer pulls in `@graphql-tools/utils` 9.2.1, which is affected by GHSA-7mx3-vvmw-hjmv (prototype pollution in `mergeDeep`).
