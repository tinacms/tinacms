---
"@tinacms/cli": minor
---

The local dev-server media endpoint now supports a `search` query param, so media-manager search works in `tinacms dev`. Matching filenames are found recursively within the requested folder (case-insensitive substring), mirroring the cloud behaviour. The recursive walk stays within the media root — entries whose real path escapes it (via symlink) are skipped.
