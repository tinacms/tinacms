---
"next-tinacms-dos": patch
"next-tinacms-cloudinary": patch
---

Sanitize the uploaded filename before writing it to the temp directory, and fix an inert multer `destination` misconfiguration.