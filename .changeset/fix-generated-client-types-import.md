---
"@tinacms/cli": patch
---

Fix the generated `client.ts` / `databaseClient.ts` `./types` import so it satisfies both TypeScript strict mode and Node native ESM. The generated import is now `import { queries } from "./types.js"` unconditionally, and the CLI emits a co-resident `types.js` alongside `types.ts` for TypeScript projects. Modern TS module resolution (`bundler` / `node16` / `nodenext`) rewrites the `.js` import back to `types.ts` at compile time, so type checking still sees the `.ts` source and `allowImportingTsExtensions` is not required, while Node ESM consumers resolve the on-disk `.js` file at runtime.
