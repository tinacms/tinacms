---
"tinacms": minor
---

Add a search box and a folder/file filter to the media manager. Typing in the search box filters the library by filename (debounced, recursive across folders) via the assets-api `search` param; the `All | Folders | Files` toggle narrows what's shown. Works against both TinaCloud-backed media and local dev media.
