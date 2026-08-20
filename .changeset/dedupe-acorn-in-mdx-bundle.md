---
"@tinacms/scripts": patch
"@tinacms/mdx": patch
---

Ship one copy of the `acorn` parser in `@tinacms/mdx` instead of three, cutting `dist/index.browser.js` from 1,976,421 to 1,578,764 bytes (440,787 to 356,471 gzipped) and `dist/index.js` from 2,013,419 to 1,615,828 bytes (452,063 to 367,630 gzipped). The catalog pinned `acorn` to 8.8.2 while `micromark-extension-mdxjs` pulled 8.16.0, so two 8.x copies were bundled side by side; separately, `acorn-jsx` reaches `acorn` through `require`, which acorn's export map answers with its CJS build while every other importer gets the ESM build, bundling the parser a second time. Aligning the catalog to `^8.16.0` and aliasing `acorn` to its ESM entry in the `@tinacms/mdx` esbuild config collapses all three into one. Parser and serializer output is unchanged — `parseMDX`/`serializeMDX` round-trips over the package's 64 markdown fixtures produce byte-identical results from the old and new bundles.
