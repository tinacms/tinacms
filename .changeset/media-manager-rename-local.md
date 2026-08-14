---
"tinacms": minor
"@tinacms/cli": minor
---

Add a Rename action to the Media Manager, backed by the local dev server.

Selecting a file in the media preview now offers Rename alongside Insert and Delete. The modal edits the basename, keeps the extension, previews the sanitised result using the same rules uploads apply, and reports collisions and missing files specifically instead of a generic failure. Every open media picker refreshes afterwards, and pickers previewing the renamed file follow it to its new path.

Renaming does **not** update content that already references the old path — the modal says so explicitly.

The action only appears when the media store implements `rename`. `TinaMediaStore` implements it for local development via a new `POST /media/rename` route on the CLI dev server; TinaCloud, static and self-hosted repo-media stores do not advertise it, so the action stays hidden there rather than failing on click. Third-party stores (S3, Cloudinary, DigitalOcean Spaces, Azure) can opt in by implementing `MediaStore.rename`.

`MediaManager.rename()` dispatches `media:rename:start`, `media:rename:success` and `media:rename:failure`.
