---
"@tinacms/cli": patch
---

Reject cross-origin state-changing requests on the dev server. Previously the `cors` middleware only suppressed response headers, so an attacker-controlled page could still drive a cross-origin multipart upload to completion (writing files into the media root). State-changing routes (`/media/upload`, `/media` DELETE, `searchIndex` POST/DELETE, and `/graphql` POST) now reject disallowed origins server-side with a 403.
