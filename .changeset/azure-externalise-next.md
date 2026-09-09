---
"next-tinacms-azure": minor
---

Stop bundling Next.js into the published package.

`handlers.ts`, `delivery-handlers.ts` and `auth.ts` import values from `next/server` and `next/headers`, not just types. The build marks a package's `dependencies` and `peerDependencies` as external, and `next` sat in `devDependencies`, so esbuild inlined Next.js and part of React into three of the four entry points. `dist/handlers.js` was 288 KB, `dist/delivery-handlers.js` 287 KB and `dist/auth.js` 228 KB.

A consumer therefore loaded a second copy of the Next.js runtime alongside the one their app already had, which is a hazard around server-component and request-context boundaries as well as a size problem.

Declaring `next` as a peer dependency puts it back on the external list. `dist/` drops from 868 KB to 44 KB, and the three entry points now emit plain `import … from "next/server"` and `import … from "next/headers"`.

Every consumer of this package already has Next.js installed, so the peer requirement reflects what the code has always needed at runtime.
