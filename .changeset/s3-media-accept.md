---
'next-tinacms-s3': minor
---

Add an `accept` option to `createMediaHandler`. The handler checks each upload against it, with the same rules as `media.accept` in your Tina config. When `accept` is not set, the default media types apply. If you changed `media.accept`, pass the same value to `accept`. The upload URL now includes the file's content type, so deploy the admin and the API route together. `getUploadUrl` takes a new optional options argument.
