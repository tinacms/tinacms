---
'@tinacms/schema-tools': minor
'@tinacms/cli': patch
'tinacms': patch
---

The local media server uses `media.accept` for uploads and renames, and answers 415 with a message for a type that is not allowed. The default list names image and text types one by one and includes `audio/*`. Some types need an exact entry: a wildcard such as `image/*` does not admit them. For example, to allow SVG, add `image/svg+xml` or `.svg` to `media.accept`. An entry such as `.svg` now also works in the file picker.
