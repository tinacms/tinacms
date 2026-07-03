---
"@tinacms/cli": patch
"tinacms": patch
"next-tinacms-dos": patch
"next-tinacms-s3": patch
"next-tinacms-cloudinary": patch
"next-tinacms-azure": patch
---

Validate media upload file types on the server and reject active document types (e.g. `.html`, `.svg`, `.js`) instead of relying on the client-side accept filter alone.
