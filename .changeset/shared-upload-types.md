---
'@tinacms/schema-tools': minor
'tinacms': patch
---

Add shared checks for media upload names and types, in the `media.accept` format. The media manager uses the same default list. That list names image and text types one by one and includes `audio/*`. An entry such as `.svg` in `media.accept` now works in the file picker.
