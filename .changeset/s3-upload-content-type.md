---
"next-tinacms-s3": patch
---

The upload URL now includes the file's content type, and the upload must send that same type. The API route does not issue upload URLs for HTML, XML, script or multipart types. If a media store from an earlier version sends no content type, the route uses the standard type for the file extension. A plus sign in a file name is kept, and the media URL encodes it as `%2B`.
