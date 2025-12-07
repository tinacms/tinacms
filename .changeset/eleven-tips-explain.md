---
"@tinacms/graphql": patch
"@tinacms/metrics": patch
"@tinacms/cli": patch
"@tinacms/scripts": patch
"create-tina-app": patch
"next-tinacms-azure": patch
"tinacms": patch
---

- `@tinacms/graphql`: remove scmp dependency, replaced with modern code (now inbuilt)
- `@tinacms/metrics`: remove isomorphic-fetch dependency, now relies on global fetch
- `@tinacms/cli`: remove log4js dependency, replaced with custom logger implementation; update chalk to v5 (ESM-only)
- `@tinacms/scripts`, `create-tina-app`: update chalk to v5 (ESM-only)
- `next-tinacms-azure`: Buffer to Uint8Array conversion
- `tinacms`: TypeScript style prop typing
