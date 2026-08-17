---
"tinacms-authjs": patch
---

Fix the package outside webpack. Unwraps the CommonJS default export of `next-auth`, and stops the node entry importing the browser `tinacms` package for a single string constant. Netlify Functions, Vercel Functions and plain Node ESM previously failed with `(0 , import_credentials.default) is not a function`; a bundled backend function also drops from roughly 18 MB to 824 KB.
