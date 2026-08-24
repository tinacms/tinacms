---
'next-tinacms-cloudinary': patch
---

Bump `cloudinary` to `^2.7.0`

The catalog pinned `^1.41.3`, which carried GHSA-g4mf-96x5-5m2c (argument injection via ampersand, patched in 2.7.0) and pulled in the deprecated `q` promise library. v2 drops `q`, `core-js` and `cloudinary-core`, leaving `lodash` as its only dependency.

No code changes were needed: the package already imports the v2 API, and every method it uses (`config`, `uploader.upload`, `uploader.destroy`, `search`, `api.root_folders`, `api.sub_folders`) is unchanged. Of v2.0.0's three breaking changes, `secure` defaulting to true is already set explicitly, URL analytics only affects SDK-generated URLs rather than the Search API response fields this package reads, and the dropped Node 6/8 support is long past.
