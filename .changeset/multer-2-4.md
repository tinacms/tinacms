---
"next-tinacms-cloudinary": patch
"next-tinacms-dos": patch
---

Bump `multer` from `2.2.0` to `2.4.0`, which fixes CVE-2026-88932 and the four CVEs fixed in 2.3.0.

Uploads behave the same. Both adapters accept one file in the `file` field and read `directory` from the body. The behaviour changes in 2.3 and 2.4 cover upload limits, which neither adapter sets, and escaped characters in field names.
