---
"next-tinacms-dos": patch
---

The upload route checks the content type the browser sends and returns 415 for HTML, XML, script or multipart types, so it no longer stores a file that a browser would run as a page.
