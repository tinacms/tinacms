---
"tinacms-authjs": patch
---

Unwrap the CommonJS default export of `next-auth` so the package works outside webpack. Netlify Functions, Vercel Functions and plain Node ESM previously failed with `(0 , import_credentials.default) is not a function`.
