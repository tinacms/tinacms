---
"tinacms": minor
"@tinacms/cli": minor
---

Add media-manager search and a folder/file filter, and refresh the grid.

Search filters the library by filename (debounced, recursive across folders); the `All | Folders | Files` toggle narrows the view. Folders and files render in labelled sections, files show a type badge (JPEG/PNG/MP4…), and videos show a play overlay.

Search works against both TinaCloud media and local dev media — the local dev-server media endpoint (`@tinacms/cli`) now honours a `search` query param, matching filenames recursively within the requested folder (case-insensitive) and staying within the media root.
