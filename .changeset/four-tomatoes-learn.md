---
'@tinacms/toolkit': patch
"next-tinacms-cloudinary": patch
"next-tinacms-dos": patch
"next-tinacms-s3": patch
---

- Adds newly added images to the top of the list and selects them
- Adds a refresh button to the image list
- Fixes a bug where you could not upload images in a directory (Locally)
- Adds a new folder button to the media manager
- Logs error messages from the handlers so the user is aware of them (previously they were just swallowed and returned in the response message but this is harder to find)
