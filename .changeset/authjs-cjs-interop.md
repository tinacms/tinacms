---
"tinacms-authjs": patch
---

Fix the package outside webpack. Unwraps the CommonJS default export of `next-auth`, and stops the node entry importing the browser `tinacms` package for a single string constant. Netlify Functions, Vercel Functions and plain Node ESM previously failed to load with `(0 , import_credentials.default) is not a function`. Dropping that import also shrinks bundled backends: the Netlify Functions sample from the docs goes from 21.0 MB to 5.4 MB.
