---
'next-tinacms-azure': patch
'next-tinacms-cloudinary': patch
'next-tinacms-dos': patch
'next-tinacms-s3': patch
---

Drop the unused `@types/crypto-js` devDependency

`crypto-js` itself was removed from `tinacms` and `@tinacms/cli`, and no source file in these packages imports it, so the type package had nothing left to type.
